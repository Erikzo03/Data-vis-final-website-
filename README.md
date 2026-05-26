# Dark Fleet — A Fleet That Disappears

An interactive data journalism visualization exploring the global "dark fleet" phenomenon: fishing vessels that deliberately disable their AIS transponders while at sea.

**Live site:** [erikzo03.github.io/Data-vis-final-website-](https://erikzo03.github.io/Data-vis-final-website-/)
**Data source:** [globalfishingwatch.org](https://globalfishingwatch.org/)

---

## Running the Website Locally

The visualization is a self-contained static website with no build step required.

1. **Clone the repository**

   ```bash
   git clone https://github.com/Erikzo03/Data-vis-final-website-.git
   ```

2. **Open the folder in Visual Studio Code**
   File → Open Folder → select the cloned directory.

3. **Install the Live Server extension** (if not already installed)
   Go to the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`), search for **Live Server** by Ritwick Dey, and click Install.

4. **Launch the site**
   Right-click on `Dark Fleet.html` in the file explorer and select **"Open with Live Server"**. A browser tab will open automatically at `http://127.0.0.1:5500/Dark%20Fleet.html`.

> **Why Live Server?** The globe section uses `fetch()` to load TopoJSON world geometry, which browsers block when a file is opened directly from disk (`file://` protocol) due to CORS restrictions. Live Server serves the files over HTTP, bypassing this without requiring any additional runtime.

