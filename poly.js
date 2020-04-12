function $(s) {
	return document.querySelectorAll(s);
}

function $s(s) {
	return document.querySelector(s);
}

const poly = $s("#poly")
const loader = $s("#loader")
const sampler = new Tone.Sampler({
	"C4": "snare1.wav",
	"D4": "snare2.wav",
}, function () {
	poly.removeChild(loader)
	poly.appendChild(viewMain())
}).toMaster()

function viewMain() {
	const main = document.createElement("div")

	let prev
	main.appendChild(viewControls(function (b1, b2, bp) {
		prev.killTimer()
		main.removeChild(prev)
		prev = viewVisualizer(b1, b2, bp)
		main.append(prev)
	}))
	prev = viewVisualizer(3, 4, 40)
	main.append(prev)

	return main
}

function viewControls(callback) {
	const controls = document.createElement("div")
	controls.classList.add("controls")

	let b1 = 3
	let b2 = 4
	let bp = 40

	const beat1 = viewValue("beat1", 3, function (e) {
		b1 = e.target.value
		callback(b1, b2, bp)
	})
	const beat2 = viewValue("beat2", 4, function (e) {
		b2 = e.target.value
		callback(b1, b2, bp)
	})
	const bpm = viewValue("bpm", 40, function (e) {
		bp = e.target.value
		callback(b1, b2, bp)
	})

	controls.append(beat1)
	controls.append(beat2)
	controls.append(bpm)

	return controls
}

function viewValue(name, defaultValue, callback) {
	const value = document.createElement("div")
	const value_text = document.createElement("p")
	const value_input = document.createElement("input")

	value.classList.add("value")
	value_text.classList.add("value_text")
	value_text.innerText = name
	value_input.classList.add("value_input")
	value_input.type = "number"
	value_input.min = 1
	value_input.max = 300
	value_input.step = 1
	value_input.value = defaultValue
	value_input.onchange = callback

	value.appendChild(value_text)
	value.appendChild(value_input)

	return value
}

function viewVisualizer(beat1, beat2, bpm, options) {
	const visualizer = document.createElement("div")
	const a = []
	let it = -1
	let prev = null
	let timer
	let delay = 60*1000 / bpm / beat2

	function tick() {
		if (it != -1) {
			let x = ~~(it/beat2)
			let y = it%beat2
			if (prev) prev.dataset.beat = false
			a[x][y].dataset.beat = true
			prev = a[x][y]
		}
		// queue for next beat to reduce lag
		if ((it+1)%beat1 == 0) sampler.triggerAttackRelease("C4", delay/2, "+"+delay/1000)
		if ((it+1)%beat2 == 0) sampler.triggerAttackRelease("D4", delay/2, "+"+delay/1000)
		it = (it+1) % (beat1*beat2)
		timer = setTimeout(tick, delay)
	}

	visualizer.classList.add("visualizer")

	for (let i=0; i<beat1; i++) {
		const row = document.createElement("div")
		const lrow = []
		row.classList.add("row")
		visualizer.append(row)
		a.push(lrow)

		for (let j=0; j<beat2; j++) {
			const cell = document.createElement("div")
			if (j == 0) cell.classList.add("beat1")
			if ((i*beat2 + j) % beat1 == 0) cell.classList.add("beat2")
			cell.classList.add("cell")
			cell.innerText = j+1
			row.append(cell)
			lrow.push(cell)
		}
	}

	visualizer.killTimer = function () {
		clearInterval(timer)
	}

	tick()

	return visualizer
}
