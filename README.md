# Ancient Love

A code-first framework for building [love2d](https://love2d.org/) games in typescrip utilizing the amazing [typescript2lua](https://typescripttolua.github.io/).

<span style="background: linear-gradient(to right, #ff7e5f, #feb47b) 10%; 
             -webkit-background-clip: text; 
             -webkit-text-fill-color: transparent; filter: drop-shadow(0px 4px 4px #000)">
Note: ancient-love is still a work-in-progress.
</span>

...may your games built with <span style="color:hotpink">love</span> last centuries.

## Roadmap

These are the modules which are completed

- [x] logging
- [x] scene
- [x] ECS
- [x] timer
- [x] signals
- [x] Observables
- [x] camera via Cam11
- [x] tween via flux
- [x] color
- [x] GLSL shader syntax highlighting
- [x] collision system
- [ ] debugger (this partially works)
- [ ] controller / input mapping
- [ ] advanced collisions
- [ ] curved geometries / lerp'd things
- [ ] UI
- [ ] Sound Mixer

### Github action

- [ ] https://github.com/marketplace/actions/love-build

### Not included, for now

- animations
- bones / splines
- Documentation

## Getting Started

1. Create a new empty directory for your game, and `cd` into it
2. Run `npm create ancient-love` in the new directory
3. Run `npm install`
4. Run `code -n .` to open a new VSCode window into the directory
5. Install the suggested extensions
6. Configure your game by editing `game.json` and `src/conf.ts`

All together:

```sh
mkdir my_game_name
cd my_game_name
npm create ancient-love
npm install
code -n .
```

## Developing your game

Use `npm run dev` to watch for typescript file changes within `src`.
it will output to the `build` directory.

## Building your game

Use `npm run build` to build your game, once.

## Running your built game

You can run the game via `npm run love`, or `love ./build`.
There are VSCode tasks available by default for running your game.

### Hot Module Replacement (HMR)

You can use HMR via `npm run hmr`.

Having one shell running `npm run dev` and another running `npm run hmr` could be a very good workflow!

Note: Hot module replacement _mostly_ works but isn't perfect. Figure it functions by reloading changed lua files in your love game—so expect the idempotent-ness code of that file to determine how easily it can be re-ran.

## Packaging your game

Note that packaging is a script that automates the [steps from love2d.org's Game Distribution](https://love2d.org/wiki/Game_Distribution) page (with some pretty output). So, if you run into errors, want to understand it, or want to manually build—that's there for you.

#### Prerequisites

1. Make sure your game is first built via `npm run build`.
2. Make sure your `game.json` has the correct configuration (values for `game_name`, and the `platforms` you want to build for are filled-in)

3. Run `npm run love:build` to build for your platforms listed in `game.json`

   - You can also pass specific overrides to this script: `npm run love:build -- game_version=alpha` to build a game with the version "alpha".
   - By default the version is the value of `game_version` in `game.json`, or the checksum of the `./build` directory

4. Check `dist` for the related files to be distributed
