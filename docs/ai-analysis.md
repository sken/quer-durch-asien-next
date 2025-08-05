## Context Generation Using code2prompt

I used the [`code2prompt`](https://github.com/agenty-co/code2prompt) library to generate context for this old repository. It helped summarize the codebase, extract relevant information, and create a high-level understanding of the project's structure and functionality.

```
code2prompt quer-durch-asien --exclude="assets/*,sitemap.xml" --output-file=quer-durch-asien/prompt.txt
```