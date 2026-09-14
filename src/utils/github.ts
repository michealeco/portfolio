export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
  branch?: string;
}

export interface CommitResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  error?: string;
}

/**
 * Safely converts a UTF-8 string to base64 for GitHub API compatibility
 */
function utf8ToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Commits updated JSON content to a GitHub repository using GitHub's REST API.
 */
export async function commitFileToGitHub(
  config: GitHubConfig,
  data: unknown,
  commitMessage: string = 'Update portfolio projects via Admin Panel'
): Promise<CommitResult> {
  const { token, owner, repo, path, branch = 'main' } = config;

  if (!token.trim()) {
    return { success: false, error: 'GitHub Personal Access Token is required.' };
  }
  if (!owner.trim() || !repo.trim() || !path.trim()) {
    return { success: false, error: 'GitHub owner, repository, and path must be specified.' };
  }

  const cleanToken = token.trim();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers: HeadersInit = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: Fetch current file SHA if it exists
    let existingSha: string | undefined;
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });

    if (getRes.ok) {
      const getJson = await getRes.json();
      existingSha = getJson.sha;
    } else if (getRes.status === 401 || getRes.status === 403) {
      return {
        success: false,
        error: 'Authentication failed. Please check your GitHub Personal Access Token permissions.',
      };
    } else if (getRes.status !== 404) {
      const errData = await getRes.json().catch(() => ({}));
      return {
        success: false,
        error: errData.message || `Failed to fetch file status from GitHub (HTTP ${getRes.status})`,
      };
    }

    // Step 2: Format content into pretty JSON string and encode to Base64
    const jsonContent = JSON.stringify(data, null, 2) + '\n';
    const base64Content = utf8ToBase64(jsonContent);

    // Step 3: Send PUT request to create/update content
    const putBody: Record<string, unknown> = {
      message: commitMessage,
      content: base64Content,
      branch,
    };
    if (existingSha) {
      putBody.sha = existingSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody),
    });

    const putJson = await putRes.json().catch(() => ({}));

    if (!putRes.ok) {
      return {
        success: false,
        error: putJson.message || `Failed to commit changes to GitHub (HTTP ${putRes.status})`,
      };
    }

    return {
      success: true,
      commitSha: putJson.commit?.sha,
      commitUrl: putJson.commit?.html_url,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    return { success: false, error: `Network error: ${message}` };
  }
}
