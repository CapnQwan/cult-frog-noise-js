## Dev Notes

Here you will find notes form my development proccess, wether that be notes for future improvements
or just details about attempted or tried concepts

### Sampling Points

The package probably needs a way to sample specific points. say we don't want to create a whole map, But we want
to sample a selection of locations a cross a map `(50, 50)` and `(100, 50)`. So adding some sort of pre defined 
structure that contains the pre validated config, a PRNG seed, and all of the pre calculated octive items would
circumvent this issue. This way you create one config structure and pass it into something like

```
const config = new Perlin2D.Config({
  persistance: 0.5,
  ...
})
const point = Perlin2D.sample(50, 50, config);
const point2 = Perlin2D.sample(100, 50, config);
```

Something roughly like that. So in hot paths the config is already validated, the values stay across calls.
