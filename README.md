# FONTO

## MVP

- [ ] draw and edit shapes
  - [x] draw lines
  - [x] draw circles
  - [x] draw paths
  - [x] edit lines
  - [x] edit circles
  - [x] edit paths
  - [x] enable Cubic Bezier curves
  - [ ] extend paths once drawn
    - [x] requires pointer to svg coords helper
    - [x] requires mode redesign
    - [x] requires path draw
    - [ ] requires EditPoint redesign
  - [x] add edit point to existing path
  - [x] add edit point to the middle of existing path
  - [ ] add arcs for "rounding corners"
  - [x] add move functionality
  - [x] add scale functionality
  - [ ] add upper/lower case switch functionality
- [ ] timeline
  - [x] html & css
  - [x] create keyframe point 
  - [ ] add exact keyframes 
  - [ ] remove keyframe point 
  - [ ] move keyframe point 
  - [x] play animation 
- [ ] make "canvas" editable
  - [ ] change svg size
  - [ ] change svg zoom level
  - [ ] add snapping
- [ ] create font
  - [ ] set text in font as background
  - [ ] convert with opentype.js
  - [ ] create letter by letter approach
- [ ]


- [ ] move tool

## Bugs

### Date

#MODE description

### Sunday 19.04.26

#PATH-EDIT Move EditPoint, try move it again. It takes two clicks. It shouldn't.

~#PATH-EDIT Move AnchorPoint, AnchoredPoints update correctly, path doesn't
because `M x' y' C x1 y1, x2 y2, x y`'s `x1 y1` and `x2 y2` don't move with `x' y'` and `x y` respectively.~

### Monday 20.04.26

#PATH-EDIT Lack of references to prev and next edit points, complexity is high. 'dblclick' doesn't create the correct anchor paths. (pressing a point should only give that one 0--.--0)
