#!/usr/bin/env python3
"""Convert all .md files in research/ to styled .html files with Mermaid diagram support."""

import os
import markdown
import glob
import re

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
    <style>
        :root {{
            --bg: #0d1117;
            --card: #161b22;
            --border: #30363d;
            --text: #e6edf3;
            --text-muted: #8b949e;
            --accent: #58a6ff;
            --accent-hover: #79c0ff;
            --green: #3fb950;
            --red: #f85149;
            --yellow: #d29922;
            --purple: #bc8cff;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            max-width: 960px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
        }}
        h1 {{
            font-size: 2rem;
            border-bottom: 2px solid var(--accent);
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
            color: var(--accent);
        }}
        h2 {{
            font-size: 1.5rem;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: var(--accent-hover);
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.3rem;
        }}
        h3 {{
            font-size: 1.2rem;
            margin-top: 1.8rem;
            margin-bottom: 0.8rem;
            color: var(--purple);
        }}
        h4 {{
            font-size: 1rem;
            margin-top: 1.2rem;
            margin-bottom: 0.5rem;
            color: var(--text);
        }}
        p {{
            margin-bottom: 1rem;
        }}
        a {{
            color: var(--accent);
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
            color: var(--accent-hover);
        }}
        code {{
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.15rem 0.4rem;
            font-size: 0.9em;
            font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
            color: var(--accent-hover);
        }}
        pre {{
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem 1.2rem;
            overflow-x: auto;
            margin: 1rem 0;
            position: relative;
        }}
        pre code {{
            background: none;
            border: none;
            padding: 0;
            color: var(--text);
            font-size: 0.85rem;
            line-height: 1.6;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: var(--card);
            border-radius: 8px;
            overflow: hidden;
        }}
        th {{
            background: #1c2333;
            color: var(--accent);
            font-weight: 600;
            text-align: left;
            padding: 0.75rem 1rem;
            border-bottom: 2px solid var(--border);
        }}
        td {{
            padding: 0.6rem 1rem;
            border-bottom: 1px solid var(--border);
        }}
        tr:last-child td {{
            border-bottom: none;
        }}
        tr:hover td {{
            background: rgba(88, 166, 255, 0.05);
        }}
        blockquote {{
            border-left: 4px solid var(--accent);
            background: var(--card);
            padding: 0.8rem 1.2rem;
            margin: 1rem 0;
            border-radius: 0 8px 8px 0;
            color: var(--text-muted);
        }}
        blockquote strong {{
            color: var(--yellow);
        }}
        ul, ol {{
            padding-left: 1.5rem;
            margin-bottom: 1rem;
        }}
        li {{
            margin-bottom: 0.3rem;
        }}
        li ul, li ol {{
            margin-bottom: 0;
        }}
        hr {{
            border: none;
            border-top: 1px solid var(--border);
            margin: 2rem 0;
        }}
        strong {{
            color: var(--text);
            font-weight: 600;
        }}
        em {{
            color: var(--text-muted);
        }}
        .mermaid {{
            background: #1a1f2e;
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: center;
        }}
        .nav {{
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem 1.2rem;
            margin-bottom: 2rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            align-items: center;
        }}
        .nav a {{
            font-size: 0.85rem;
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            background: rgba(88, 166, 255, 0.1);
        }}
        .nav a:hover {{
            background: rgba(88, 166, 255, 0.2);
            text-decoration: none;
        }}
        .nav-label {{
            font-weight: 600;
            color: var(--text-muted);
            font-size: 0.85rem;
        }}
        input[type="checkbox"] {{
            accent-color: var(--green);
            transform: scale(1.2);
            margin-right: 0.3rem;
        }}
        /* Scrollbar */
        ::-webkit-scrollbar {{ width: 8px; height: 8px; }}
        ::-webkit-scrollbar-track {{ background: var(--bg); }}
        ::-webkit-scrollbar-thumb {{ background: var(--border); border-radius: 4px; }}
        ::-webkit-scrollbar-thumb:hover {{ background: var(--text-muted); }}

        @media (max-width: 768px) {{
            body {{ padding: 1rem; }}
            h1 {{ font-size: 1.5rem; }}
            table {{ font-size: 0.85rem; }}
            th, td {{ padding: 0.4rem 0.6rem; }}
        }}
    </style>
</head>
<body>
    <nav class="nav">
        <span class="nav-label">Navigation:</span>
        <a href="index.html" style="background:rgba(63,185,80,0.2);color:#3fb950;font-weight:600;">Home</a>
        <a href="00-executive-summary.html">Summary</a>
        <a href="01-product-identity.html">Identity</a>
        <a href="02-competitive-analysis.html">Competitors</a>
        <a href="03-target-market.html">Market</a>
        <a href="04-user-flow.html">UX Flow</a>
        <a href="05-mvp-definition.html">MVP</a>
        <a href="06-architecture.html">Architecture</a>
        <a href="07-tech-stack.html">Tech Stack</a>
        <a href="08-integrations.html">Integrations</a>
        <a href="10-database-design.html">Database</a>
        <a href="11-sequence-diagrams.html">Sequences</a>
        <a href="12-project-flow.html">Project Flow</a>
        <a href="13-security.html">Security</a>
        <a href="14-legal-compliance.html">Legal</a>
        <a href="15-implementation-phases.html">Phases</a>
        <a href="16-production-checklist.html">Checklist</a>
        <a href="17-devops.html">DevOps</a>
        <a href="18-monetization.html">Revenue</a>
        <a href="19-cost-management.html">Costs</a>
        <a href="20-marketing.html">Marketing</a>
        <a href="21-analytics-kpis.html">KPIs</a>
        <a href="22-accessibility-i18n.html">A11y</a>
        <a href="23-support-docs.html">Support</a>
        <a href="24-team-hiring.html">Team</a>
        <a href="25-risk-assessment.html">Risks</a>
        <a href="26-future-roadmap.html">Roadmap</a>
    </nav>
    {content}
    <script>
        mermaid.initialize({{
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {{
                primaryColor: '#1f6feb',
                primaryTextColor: '#e6edf3',
                primaryBorderColor: '#58a6ff',
                lineColor: '#8b949e',
                secondaryColor: '#161b22',
                tertiaryColor: '#0d1117',
                background: '#0d1117',
                mainBkg: '#161b22',
                nodeBorder: '#30363d',
                clusterBkg: '#161b22',
                titleColor: '#58a6ff',
                edgeLabelBackground: '#161b22',
            }}
        }});
    </script>
</body>
</html>"""


def convert_mermaid_blocks(html_content):
    """Convert ```mermaid code blocks to <div class="mermaid"> blocks."""
    # Match all variations: with/without highlight class, with/without codehilite wrapper
    patterns = [
        r'<pre class="highlight"><code class="language-mermaid">(.*?)</code></pre>',
        r'<pre><code class="language-mermaid">(.*?)</code></pre>',
        r'<div class="highlight"><pre><span></span><code class="language-mermaid">(.*?)</code></pre></div>',
        r'<pre class="codehilite"><code class="language-mermaid">(.*?)</code></pre>',
    ]

    def replace_mermaid(match):
        code = match.group(1)
        # Unescape HTML entities that markdown adds
        code = code.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&quot;', '"').replace('&#x27;', "'")
        # Remove any leftover span tags from syntax highlighting
        code = re.sub(r'<span[^>]*>', '', code)
        code = code.replace('</span>', '')
        return f'<div class="mermaid">\n{code}\n</div>'

    for pattern in patterns:
        html_content = re.sub(pattern, replace_mermaid, html_content, flags=re.DOTALL)

    return html_content


def convert_checkboxes(html_content):
    """Convert [ ] and [x] to HTML checkboxes."""
    html_content = html_content.replace('[ ]', '<input type="checkbox" disabled>')
    html_content = html_content.replace('[x]', '<input type="checkbox" checked disabled>')
    return html_content


def get_title(md_content):
    """Extract first H1 as title."""
    for line in md_content.split('\n'):
        if line.startswith('# '):
            return line[2:].strip()
    return 'Research Document'


def convert_file(md_path, html_path, prefix=''):
    """Convert a single markdown file to HTML. prefix='../' for subdirectory files."""
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    title = get_title(md_content)

    # Convert markdown to HTML
    extensions = ['tables', 'fenced_code', 'codehilite', 'toc', 'nl2br']
    html_content = markdown.markdown(
        md_content,
        extensions=extensions,
        extension_configs={
            'codehilite': {'css_class': 'highlight', 'guess_lang': False}
        }
    )

    # Post-process
    html_content = convert_mermaid_blocks(html_content)
    html_content = convert_checkboxes(html_content)

    # Wrap in template
    full_html = HTML_TEMPLATE.format(title=title, content=html_content)

    # Fix relative paths for subdirectory files
    if prefix:
        full_html = full_html.replace('href="index.html"', f'href="{prefix}index.html"')
        full_html = full_html.replace('href="00-', f'href="{prefix}00-')
        full_html = full_html.replace('href="01-', f'href="{prefix}01-')
        full_html = full_html.replace('href="02-', f'href="{prefix}02-')
        full_html = full_html.replace('href="03-', f'href="{prefix}03-')
        full_html = full_html.replace('href="04-', f'href="{prefix}04-')
        full_html = full_html.replace('href="05-', f'href="{prefix}05-')
        full_html = full_html.replace('href="06-', f'href="{prefix}06-')
        full_html = full_html.replace('href="07-', f'href="{prefix}07-')
        full_html = full_html.replace('href="08-', f'href="{prefix}08-')
        full_html = full_html.replace('href="10-', f'href="{prefix}10-')
        full_html = full_html.replace('href="11-', f'href="{prefix}11-')
        full_html = full_html.replace('href="12-', f'href="{prefix}12-')
        full_html = full_html.replace('href="13-', f'href="{prefix}13-')
        full_html = full_html.replace('href="14-', f'href="{prefix}14-')
        full_html = full_html.replace('href="15-', f'href="{prefix}15-')
        full_html = full_html.replace('href="16-', f'href="{prefix}16-')
        full_html = full_html.replace('href="17-', f'href="{prefix}17-')
        full_html = full_html.replace('href="18-', f'href="{prefix}18-')
        full_html = full_html.replace('href="19-', f'href="{prefix}19-')
        full_html = full_html.replace('href="20-', f'href="{prefix}20-')
        full_html = full_html.replace('href="21-', f'href="{prefix}21-')
        full_html = full_html.replace('href="22-', f'href="{prefix}22-')
        full_html = full_html.replace('href="23-', f'href="{prefix}23-')
        full_html = full_html.replace('href="24-', f'href="{prefix}24-')
        full_html = full_html.replace('href="25-', f'href="{prefix}25-')
        full_html = full_html.replace('href="26-', f'href="{prefix}26-')

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)

    print(f"  {os.path.basename(md_path)} -> {os.path.basename(html_path)}")


def main():
    research_dir = os.path.dirname(os.path.abspath(__file__))

    # Convert top-level .md files
    md_files = sorted(glob.glob(os.path.join(research_dir, '*.md')))
    print(f"Converting {len(md_files)} markdown files to HTML...\n")

    for md_path in md_files:
        html_path = md_path.rsplit('.', 1)[0] + '.html'
        convert_file(md_path, html_path)

    # Convert setup guides
    guides_dir = os.path.join(research_dir, '09-setup-guides')
    if os.path.exists(guides_dir):
        guide_files = sorted(glob.glob(os.path.join(guides_dir, '*.md')))
        print(f"\nConverting {len(guide_files)} setup guides...")
        for md_path in guide_files:
            html_path = md_path.rsplit('.', 1)[0] + '.html'
            convert_file(md_path, html_path, prefix='../')

    # Convert frontend research
    frontend_dir = os.path.join(research_dir, 'frontend')
    if os.path.exists(frontend_dir):
        frontend_files = sorted(glob.glob(os.path.join(frontend_dir, '*.md')))
        print(f"\nConverting {len(frontend_files)} frontend research files...")
        for md_path in frontend_files:
            html_path = md_path.rsplit('.', 1)[0] + '.html'
            convert_file(md_path, html_path, prefix='../')

    print(f"\nDone! All HTML files generated.")


if __name__ == '__main__':
    main()
