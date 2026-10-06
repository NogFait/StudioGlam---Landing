// Apple (damping ratio ζ, response r) -> physical spring (mass 1):
//   ω = 2π / r ; k = ω² ; c = 2ζω
// Step response sampled into a CSS linear() easing.
function spring(zeta, response) {
  const w = (2 * Math.PI) / response
  const pos = (t) => {
    if (zeta >= 1) return 1 - (1 + w * t) * Math.exp(-w * t)
    const wd = w * Math.sqrt(1 - zeta * zeta)
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t))
  }
  // settle time: last t where |1-x| > 0.5%
  let T = 0
  for (let t = 0; t < 4; t += 0.002) if (Math.abs(1 - pos(t)) > 0.005) T = t
  T = Math.max(T, 0.05)
  const N = 28
  const pts = []
  for (let i = 0; i <= N; i++) pts.push(+pos((T * i) / N).toFixed(4))
  pts[N] = 1
  return { T, linear: `linear(${pts.join(', ')})` }
}
for (const [name, z, r] of [['snappy', 1, 0.25], ['settle', 1, 0.4], ['gentle', 1, 0.55], ['momentum', 0.8, 0.4]]) {
  const s = spring(z, r)
  console.log(`--spring-${name}: ${s.linear};`)
  console.log(`--spring-${name}-time: ${Math.round(s.T * 1000)}ms;`)
}
