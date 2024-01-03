<p align="center">
    <img
        alt="Google Slides Generator Icon"
        src="./readme-assets/icon-rounded.png"
        width="100px"
    />
    <h1 align="center"> Google Slides Generator </h1>
</p>

> A Google App Script that generates slides based on given templates

<h2> Table of Contents </h2>

- [Technologies Used](#technologies-used)
- [Functions](#functions)
	- [Create Lyric Slides](#create-lyric-slides)
		- [Inputs](#inputs)
	- [Replace All](#replace-all)
		- [Inputs for Replace All](#inputs-for-replace-all)
	- [Set Headers](#set-headers)
		- [Inputs for Set Headers](#inputs-for-set-headers)

## Technologies Used

<table>
<tbody>
	<tr align="center" valign="center">
		<td width="20.00000%" align="center">
			<a href="https://github.com/google/clasp">
				<img
					alt="Clasp Logo"
					src="./readme-assets/google.svg"
					width="100%"
				>
			</a>
		</td>		
		<td width="20.00000%" align="center">
			<a href="https://nodejs.org/en">
				<img
					alt="Node.js Logo"
					src="./readme-assets/nodejs.svg"
					width="100%"
				>
			</a>
		</td>		
		<td width="20.00000%" align="center">
			<a href="https://www.typescriptlang.org/">
				<img
					alt="Typescript Logo"
					src="./readme-assets/typescript.svg"
					width="100%"
				>
			</a>
		</td>		
		<td width="20.00000%" align="center">
			<a href="https://rollupjs.org/">
				<img
					alt="Rollup Logo"
					src="./readme-assets/rollup.svg"
					width="100%"
				>
			</a>
		</td>		
		<td width="20.00000%" align="center">
			<a href="https://eslint.org/">
				<img
					alt="ESLint Logo"
					src="./readme-assets/eslint.svg"
					width="100%"
				>
			</a>
		</td>		
	</tr>
	<tr align="center" valign="center">
		<td width="20.00000%" align="center">
			<a href="https://github.com/google/clasp">
				<b>
					Clasp
				</b>
			</a>
		</td>
		<td width="20.00000%" align="center">
			<a href="https://nodejs.org/en">
				<b>
					Node.js
				</b>
			</a>
		</td>
		<td width="20.00000%" align="center">
			<a href="https://www.typescriptlang.org/">
				<b>
					Typescript
				</b>
			</a>
		</td>
		<td width="20.00000%" align="center">
			<a href="https://rollupjs.org/">
				<b>
					Rollup
				</b>
			</a>
		</td>
		<td width="20.00000%" align="center">
			<a href="https://eslint.org/">
				<b>
					ESLint
				</b>
			</a>
		</td>
	</tr>
</tbody>
</table>

## Functions

### Create Lyric Slides

#### Inputs

- `templateTitleSlideNumber: number`
  - Indicates the slide number for the title slide that is to be used
- `templateLyricSlideNumber: number`
  - Indicates the slide number for the lyric slide that is to be used
- `insertionSlideNumber: number`
  - Indicates the slide number after which the new lyrics slides will be inserted.
- `lyricSlideItems: LyricSlideItem[]`
  - `songTitle` indidates the song title for the given song
  - `artist` indidates the artist(s) that is(are) associated with the given song
  - `lyrics` is a string with the lyrics to the given song. Each new line is a new line on the slide. Empty new lines are used to indicate new slides (`\n\n`).

### Replace All

#### Inputs for Replace All

- `oldText`
- `newText`
- `matchCase`
- `lowerBoundSlideNumber`
- `upperBoundSlideNumber`

### Set Headers

#### Inputs for Set Headers

- `templateSlideNumber: number`
- `setHeaderItems: SetHeaderItem[]`
  - `SetHeaderItem`s are composed of
    - `sectionName?: string`
    - `sectionStartNumber: number`
    - `sectionEndNumber: number`
