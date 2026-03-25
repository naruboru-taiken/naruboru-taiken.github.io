import { defineConfig } from 'astro/config';

export default defineConfig({
  // ★ GitHub Pages にデプロイする前に必ず設定してください ★
  // 例: GitHubユーザー名が "tsubaki" でリポジトリ名が "naruboru-fan-site" の場合:
  //   site: 'https://tsubaki.github.io',
  //   base: '/naruboru-fan-site',
  //
  // 独自ドメインを使う場合は base を省略し、site だけ設定してください:
  //   site: 'https://example.com',
  //
  // 設定後、内部リンクが壊れていないか npm run build で確認してください。
  site: 'https://naruboru-taiken.github.io',
  output: 'static',
});
