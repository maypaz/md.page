# md.page Demo Videos

Animated demo videos built with [Remotion](https://remotion.dev/), showcasing md.page in action.

## Demos

### MdPageDemo

A Claude Code CLI session where an agent analyzes a bug, produces rich markdown output, then publishes it to md.page. The user clicks the link and sees the beautifully rendered page in the browser.

### TelegramDemo

An OpenClaw bot in Telegram answers a recipe request with raw markdown. The user asks for an md.page link, taps it, and sees the rendered page in the browser.

## Getting Started

```bash
cd demo
npm install
```

## Preview

Launch the Remotion studio to preview and iterate on the videos:

```bash
npx remotion studio
```

## Render

Render a specific composition to MP4:

```bash
npx remotion render MdPageDemo out/mdpage-demo.mp4
npx remotion render TelegramDemo out/telegram-demo.mp4
```

## Project Structure

```
src/
  Root.tsx            # Remotion entry — registers both compositions
  MdPageDemo.tsx      # Claude Code demo orchestrator
  TerminalScene.tsx   # Simulated Claude Code CLI
  TelegramDemo.tsx    # Telegram demo orchestrator
  TelegramChat.tsx    # Telegram chat UI with bubbles
  IPhoneFrame.tsx     # iPhone device frame
  BrowserScene.tsx    # Browser chrome (shared by both demos)
  Cursor.tsx          # Animated mouse cursor
  EndCard.tsx         # Closing card with logo and taglines
public/
  browser.png         # Screenshot of bug analysis on md.page
  browser-recipe.png  # Screenshot of carbonara recipe on md.page
  logo.png            # md.page logo
  openclaw.svg        # OpenClaw crab avatar
```
