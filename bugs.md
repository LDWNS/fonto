# Bugs

## Date

#MODE description

## Sunday 19.04.26

#PATH-EDIT Move EditPoint, try move it again. It takes two clicks. It shouldn't.

#PATH-EDIT Move AnchorPoint, AnchoredPoints update correctly, path doesn't
because `M x' y' C x1 y1, x2 y2, x y`'s `x1 y1` and `x2 y2` don't move with `x' y'` and `x y` respectively.

## Monday 20.04.26

#PATH-EDIT Lack of references to prev and next edit points, complexity is high.
'dblclick' doesn't create the correct anchor paths.
