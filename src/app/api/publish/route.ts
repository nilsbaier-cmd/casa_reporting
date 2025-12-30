import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'nilsbaier-cmd/casa_reporting';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = 'public/data/published.json';

interface GitHubFileResponse {
  sha?: string;
  content?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check for GitHub token
    if (!GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { data, semester } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Prepare the content
    const content = JSON.stringify(data, null, 2);
    const contentBase64 = Buffer.from(content).toString('base64');

    // Check if file already exists (to get SHA for update)
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
        const fileData: GitHubFileResponse = await getResponse.json();
        existingSha = fileData.sha;
      }
    } catch {
      // File doesn't exist yet, that's fine
    }

    // Create or update the file
    const commitMessage = `chore: Publish CASA data for ${semester || 'current semester'}

Published via CASA Dashboard

🤖 Generated with [Claude Code](https://claude.com/claude-code)`;

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

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to publish to GitHub', details: errorData.message },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: `Data published successfully for ${semester}`,
      commit: result.commit?.sha,
      url: `https://github.com/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${FILE_PATH}`,
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
