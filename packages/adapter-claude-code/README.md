# @causign/adapter-claude-code

Discover Claude-compatible agent definitions and prepare output tests through
native Claude Code. Reference version: 2.1.284. Output shape: `{text:string}`;
capability: `observe.output`. Tools, MCP, ordinary hooks/settings and skills are
disabled for this profile; managed policy and native auth remain in effect.

Native and explicit Windows-to-WSL targets use literal argument arrays. Changed
definitions invalidate prepared launches. Models are never run during discovery.
See [discovery guide](../../docs/agent-discovery.md) and exported plugin contracts.

Development package: not yet published. No interception/tool-control claims.
