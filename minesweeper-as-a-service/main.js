const EventBus = new Vue();
const serviceLocation = location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://minesweeper-as-a-service.herokuapp.com'

const extractNumber = (raw) => {
  if (raw.includes(0)) return 0
  if (raw.includes(1)) return 1
  if (raw.includes(2)) return 2
  if (raw.includes(3)) return 3
  if (raw.includes(4)) return 4
  if (raw.includes(5)) return 5
  if (raw.includes(6)) return 6
  if (raw.includes(7)) return 7
  if (raw.includes(8)) return 8
  return 'number-unknown'
}

const gridTileTemplate = `
  <div @click="emitTileClicked('clear')"
       @contextmenu.prevent.stop="emitTileClicked('flag')"
       :class="'grid-tile ' + hiddenBorderClass">
    {{ marker }}
  </div>
`
Vue.component('grid-tile', {
  template: gridTileTemplate,
  props: ['grid-index', 'tiles'],
  computed: {
    hiddenBorderClass() {
      const raw = this.tiles[this.gridIndex]
      if (!raw) return ''
      if (raw instanceof Array) {
        if (raw.length === 0) {
          return ''
        } else if (raw.includes('hidden')) {
          return 'grid-tile-hidden'
        }
      } else {
        return raw
      }
    },
    marker() {
      const raw = this.tiles[this.gridIndex]
      if (!raw) return '?'
      if (raw instanceof Array) {
        if (raw.length === 0) {
          return '?'
        } else if (raw.includes('flag')) {
          return 'flag'
        } else if (raw.includes('hidden')) {
          return ''
        } else if (raw.includes('mine')) { // TODO: Should show this only on game over.
          return 'X'
        } else {
          const number = extractNumber(raw)
          if (number > 0) {
            return number
          } else {
            return ''
          }
        }
      } else {
        return raw
      }
    }
  },
  methods: {
    emitTileClicked(action) {
      EventBus.$emit('tile-clicked', { index: this.gridIndex, action });
    }
  }
})

// https://stackoverflow.com/a/29559488
const generateNumbers = (count) => ([...Array(count).keys()])

const minesweeperAppTemplate = `
  <div id="minesweeper-app"
       @contextmenu.prevent.stop>
    <h1 id="title">Minesweeper as a Service</h1>
    <p id="subtitle"
       :class="winOrLose"
       :style="{ visibility: gameOverVisibility }">
       <a @click.stop.prevent="playAgainClicked"
          id="play-again-link">
         Game Over!  <span id="click-here">Click Here</span> To Play Again
       </a>
    </p>
    <div>
      <table id="playing-field">
        <tbody>
          <tr v-for="y in rows">
            <td v-for="x in columns">
              <grid-tile v-bind:grid-index="gridToIndex(x, y)"
                         v-bind:tiles="tiles">
              </grid-tile>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`
Vue.component('minesweeper-app', {
  template: minesweeperAppTemplate,
  props: ['state'],
  computed: {
    width() {
      return this.state ? this.state['width'] : 0
    },
    height() {
      return this.state ? this.state['height'] : 0
    },
    columns() {
      return generateNumbers(this.width)
    },
    rows() {
      return generateNumbers(this.height)
    },
    tiles() {
      return this.state ? this.state['tiles'] : []
    },
    winOrLose() {
      return this.state && this.state['win'] ? 'win' : 'lose'
    },
    gameOverVisibility() {
      return this.state && this.state['game-over'] ? 'visible' : 'hidden'
    }
  },
  methods: {
    gridToIndex(x, y) {
      return y * this.width + x
    },
    playAgainClicked() {
      EventBus.$emit('reset-clicked')
    }
  }
})

const container = new Vue({
  el: '#container',
  data: {
    state: null
  },
  created() {
    EventBus.$on('reset-clicked', this.resetClicked)
    EventBus.$on('tile-clicked', this.tileClicked)
  },
  mounted() {
    this.resetRequested(() => {
      document.getElementById('container').style.display = 'flex'
    })
  },
  methods: {
    resetClicked() {
      this.resetRequested(() => { })
    },
    resetRequested(cb) {
      fetch(`${serviceLocation}/reset`).then((response) => {
        return response.json()
      }).then((state) => {
        this.state = state
        cb()
      })
    },
    tileClicked({ index, action }) {
      const payload = {
        ...this.state,
        'pick-grid-index': index
      }
      fetch(`${serviceLocation}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then((response) => {
        return response.json()
      }).then((state) => {
        this.state = state
      })
    },
  }
})

