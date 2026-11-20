# Torvex Lab website

A static website: plain HTML, CSS and JavaScript. There is no framework and no build step, so any static host can serve
this folder as it is.

```
index.html              home page (live flow animation, workflow, capabilities, screenshots, case list)
docs.html               documentation
about.html              about me (fill in the [brackets])
cases/index.html        list of case studies
cases/<case>.html       one page per case: problem, geometry + BCs, mesh, set-up, results, comparison, report, references
assets/css/style.css    every style (colours and fonts at the top, in :root)
assets/js/main.js       mobile menu, contents highlighting, hero animation
assets/img/             logo, favicon, screenshots (add portrait.jpg here)
assets/cases/<case>/    figures of each case
reports/                PDF reports of the cases
```

## Filling in the placeholders
* **About**: replace every `[...]` in `about.html`, the email and links, and the `[Your name]` in the footer of every page
  (search and replace across the folder).
* **Figures**: every grey striped box is a placeholder. Just above it, an HTML comment gives the `<img>` line and file name to use,
  e.g. `<img src="../assets/cases/lid-driven-cavity/mesh.png" alt="Full mesh">`. Put the image in the folder and replace the
  `<div class="slot">…</div>` with that line.
* **Numbers**: in the comparison tables, cells showing "—" (`<td class="pending">`) are waiting for TakiCFD results.
  Replace each with `<td class="num">0.1234</td>`.
* **Status**: when a case is complete, change `<span class="status">Results in preparation</span>` to
  `<span class="status done">Validated</span>`.
* **PDF report**: put `reports/<case>.pdf` in place and swap the disabled button for the link given in the comment.

## Previewing locally
Open `index.html` in a browser, or run `python -m http.server` in this folder and go to http://localhost:8000.

## Hosting (free)
* **GitHub Pages**: create a repository, upload the contents of this folder, then Settings ▸ Pages ▸ Deploy from branch ▸ `main` / root.
  The site appears at `https://<username>.github.io/<repository>/`.
* **Netlify** or **Cloudflare Pages**: drag this folder onto the dashboard ("Deploy manually"), or connect the GitHub repository
  so every push publishes the site.
* **Your own domain** (about 10–15 USD a year from Namecheap, Cloudflare, Porkbun…): add it in the host's domain settings and set
  the DNS records it gives you. HTTPS is automatic on all three hosts.
