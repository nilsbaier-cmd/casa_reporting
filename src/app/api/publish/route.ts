import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  CSRF_HEADER_NAME,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/auth/session';
import type {
  PublishedAirline,
  PublishedClassificationConfig,
  PublishedData,
  PublishedMetadata,
  PublishedRoute,
  PublishedSummary,
  PublishedTop10,
  PublishedTrendData,
} from '@/lib/analysis/publishTypes';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'nilsbaier-cmd/casa_reporting';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = 'public/data/published.json';

const MAX_RECORDS_PER_COLLECTION = 20000;

interface GitHubFileResponse {
  sha?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

function hasString(value: unknown, maxLength = 200): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

function hasOptionalString(value: unknown, maxLength = 200): value is string | null {
  return value === null || value === undefined || (typeof value === 'string' && value.length <= maxLength);
}

function validateMetadata(metadata: unknown): metadata is PublishedMetadata {
  if (!isObject(metadata)) return false;

  return (
    hasString(metadata.publishedAt, 60) &&
    hasString(metadata.semester, 30) &&
    hasString(metadata.version, 20) &&
    isObject(metadata.semesterRange) &&
    isFiniteNumber(metadata.semesterRange.startMonth) &&
    isFiniteNumber(metadata.semesterRange.endMonth) &&
    isFiniteNumber(metadata.semesterRange.year)
  );
}

function validateSummary(summary: unknown): summary is PublishedSummary {
  if (!isObject(summary)) return false;

  return (
    isNonNegativeNumber(summary.totalInads) &&
    isNonNegativeNumber(summary.includedInads) &&
    isNonNegativeNumber(summary.excludedInads) &&
    isNonNegativeNumber(summary.totalPax) &&
    isNonNegativeNumber(summary.airlinesAnalyzed) &&
    isNonNegativeNumber(summary.airlinesAboveThreshold) &&
    isNonNegativeNumber(summary.routesAnalyzed) &&
    isNonNegativeNumber(summary.routesAboveThreshold) &&
    isNonNegativeNumber(summary.medianDensity)
  );
}

function validateAirline(item: unknown): item is PublishedAirline {
  if (!isObject(item)) return false;

  return (
    hasString(item.airline, 30) &&
    hasString(item.airlineName, 120) &&
    isNonNegativeNumber(item.inadCount) &&
    typeof item.aboveThreshold === 'boolean'
  );
}

function validateRoute(item: unknown): item is PublishedRoute {
  if (!isObject(item)) return false;

  const validClassification =
    item.classification === 'sanction' ||
    item.classification === 'watchList' ||
    item.classification === 'clear';

  return (
    hasString(item.airline, 30) &&
    hasString(item.airlineName, 120) &&
    hasString(item.lastStop, 60) &&
    isNonNegativeNumber(item.inadCount) &&
    isNonNegativeNumber(item.pax) &&
    (item.density === null || item.density === undefined || isNonNegativeNumber(item.density)) &&
    validClassification
  );
}

function validateTrend(item: unknown): item is PublishedTrendData {
  if (!isObject(item)) return false;

  return (
    hasString(item.semester, 30) &&
    isNonNegativeNumber(item.inadCount) &&
    isNonNegativeNumber(item.paxCount) &&
    (item.density === null || item.density === undefined || isNonNegativeNumber(item.density))
  );
}

function validateTop10(top10: unknown): top10 is PublishedTop10 {
  if (!isObject(top10)) return false;

  if (!Array.isArray(top10.lastStops) || !Array.isArray(top10.airlines)) {
    return false;
  }

  const validLastStops = top10.lastStops.every((item) => {
    if (!isObject(item)) return false;
    return hasString(item.name, 60) && isNonNegativeNumber(item.count);
  });

  const validAirlines = top10.airlines.every((item) => {
    if (!isObject(item)) return false;
    return hasString(item.code, 30) && hasString(item.name, 120) && isNonNegativeNumber(item.count);
  });

  return validLastStops && validAirlines;
}

function validateClassificationConfig(config: unknown): config is PublishedClassificationConfig {
  if (!isObject(config)) return false;

  return (
    isNonNegativeNumber(config.minInad) &&
    isNonNegativeNumber(config.minDensity) &&
    isNonNegativeNumber(config.highPriorityMultiplier) &&
    isNonNegativeNumber(config.highPriorityMinInad)
  );
}

function validatePublishedData(data: unknown): data is PublishedData {
  if (!isObject(data)) return false;

  if (!validateMetadata(data.metadata)) return false;
  if (!validateSummary(data.summary)) return false;
  if (!validateTop10(data.top10)) return false;

  if (!Array.isArray(data.airlines) || data.airlines.length > MAX_RECORDS_PER_COLLECTION) return false;
  if (!Array.isArray(data.routes) || data.routes.length > MAX_RECORDS_PER_COLLECTION) return false;
  if (!Array.isArray(data.trends) || data.trends.length > MAX_RECORDS_PER_COLLECTION) return false;

  if (!data.airlines.every(validateAirline)) return false;
  if (!data.routes.every(validateRoute)) return false;
  if (!data.trends.every(validateTrend)) return false;

  if (data.classificationConfig && !validateClassificationConfig(data.classificationConfig)) {
    return false;
  }

  return true;
}

function sanitizeSemester(value: unknown): string {
  if (!hasOptionalString(value, 80) || !value) return 'current semester';
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function authorizeAdmin(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionToken);

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const csrfToken = request.headers.get(CSRF_HEADER_NAME);
  if (!csrfToken || csrfToken !== session.csrfToken) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authError = await authorizeAdmin(request);
  if (authError) return authError;

  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const body = await request.json();
    const data = body?.data;
    const semester = sanitizeSemester(body?.semester);

    if (!validatePublishedData(data)) {
      return NextResponse.json({ error: 'Invalid publish payload' }, { status: 400 });
    }

    const content = JSON.stringify(data, null, 2);
    const contentBase64 = Buffer.from(content).toString('base64');

    let existingSha: string | undefined;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${GITHUB_BRANCH}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (getResponse.ok) {
        const fileData = (await getResponse.json()) as GitHubFileResponse;
        existingSha = fileData.sha;
      }
    } catch {
      // File may not exist yet.
    }

    const commitMessage = `chore: Publish CASA data for ${semester}\n\nPublished via CASA Dashboard`;

    const updateBody: {
      message: string;
      content: string;
      branch: string;
      sha?: string;
    } = {
      message: commitMessage,
      content: contentBase64,
      branch: GITHUB_BRANCH,
    };

    if (existingSha) {
      updateBody.sha = existingSha;
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as { message?: string };
      return NextResponse.json(
        { error: 'Failed to publish to GitHub', details: errorData.message ?? 'Unknown error' },
        { status: response.status }
      );
    }

    const result = (await response.json()) as { commit?: { sha?: string } };

    return NextResponse.json({
      success: true,
      message: `Data published successfully for ${semester}`,
      commit: result.commit?.sha,
      url: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${FILE_PATH}`,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
