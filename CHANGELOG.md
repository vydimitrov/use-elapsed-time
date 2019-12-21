# Change Log

## 1.1.5 (December 22nd, 2019)

**Implemented enhancements:**
- Refactor internals
- Add test coverage

## 1.1.4 (December 19th, 2019)

**Implemented enhancements:**
- Add a new config option "startAt" to change the start time of the animation. Defaults to 0 if not provided

## 1.1.3 (November 27th, 2019)

**Implemented enhancements:**
- Add TypeScript type definitions

## 1.1.2 (November 16th, 2019)

**Implemented enhancements:**
- Add CHANGELOG.md to repo

## 1.1.0 (November 16th, 2019)

**Implemented enhancements:**
- `config.isRepeated` is deprecated due to an issue to toggle it while the animation loop is running
- Animation now can be repeated by returning an array `[shouldRepeat: boolean, delay: number]` from `config.onComplete`
- Code samples are removed from ReadMe and replaced with buttons to edit on CodeSandbox