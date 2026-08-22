export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 認証開始:GitHubへリダイレクト
    if (url.pathname === "/auth") {
      const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
      githubAuthUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      githubAuthUrl.searchParams.set("scope", "repo,user");
      return Response.redirect(githubAuthUrl.toString(), 302);
    }

    // 2. コールバック:GitHubからのコードをトークンに交換
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenRes.json();
      const token = tokenData.access_token;

      const script = `
        <script>
          (function() {
            function receiveMessage(e) {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({ token })}',
                e.origin
              );
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      `;

      return new Response(script, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // 3. それ以外は静的ファイルを配信
    return env.ASSETS.fetch(request);
  },
};