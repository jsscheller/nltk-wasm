export class Nltk {
  private pyodidePromise?: Promise<any>;

  constructor(private assetPath?: string) {}

  public async sentTokenize(text: string): Promise<string[]> {
    const pyodide = await this.load();
    const sent_tokenize = pyodide.globals.get("sent_tokenize");
    return sent_tokenize(text).toJSON();
  }

  private async load(): Promise<any> {
    if (this.pyodidePromise) return this.pyodidePromise;
    return (this.pyodidePromise = Promise.resolve().then(async () => {
      const { loadPyodide } = await import(this.getAssetPath("pyodide.js"));

      const pyodide = await loadPyodide();

      await Promise.all([
        pyodide.loadPackage(this.getAssetPath("nltk-3.8.1-py3-none-any.whl")),
        pyodide.loadPackage(
          this.getAssetPath(
            "regex-2024.4.16-cp312-cp312-pyodide_2024_0_wasm32.whl",
          ),
        ),
        pyodide.loadPackage("sqlite3"),
      ]);

      const { FS } = pyodide;
      FS.mkdir("/nltk_data");
      FS.mkdir("/nltk_data/tokenizers");
      FS.mkdir("/nltk_data/tokenizers/punkt");
      FS.mkdir("/nltk_data/tokenizers/punkt/PY3");
      FS.createLazyFile(
        "/nltk_data/tokenizers/punkt/PY3",
        "english.pickle",
        this.getAssetPath("english.pickle"),
        true,
        true,
      );

      pyodide.runPython(`
      import nltk
      def sent_tokenize(text):
          return nltk.sent_tokenize(text)
      `);

      return pyodide;
    }));
  }

  private getAssetPath(name: string): string {
    return (this.assetPath || "./") + name;
  }
}
