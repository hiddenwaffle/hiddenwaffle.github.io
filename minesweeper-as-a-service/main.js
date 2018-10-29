const EventBus = new Vue();
const serviceLocation = location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://minesweeper-as-a-service.herokuapp.com'

const gridTileTemplate = `
  <div @click="tileClicked"
       class="grid-tile">
    {{ marker }}
  </div>
`
Vue.component('grid-tile', {
  template: gridTileTemplate,
  props: ['grid-index', 'tiles'],
  computed: {
    marker() {
      const raw = this.tiles[this.gridIndex]
      if (!raw) return '?'
      if (raw instanceof Array) {
        if (raw.length === 0) {
          return ''
        } else if (raw.includes('hidden')) {
          return '.'
        } else if (raw.includes('mine')) { // TODO: Should show this only on game over.
          return 'X'
        }
      } else {
        return raw
      }
    }
  },
  methods: {
    tileClicked() {
      EventBus.$emit('tile-clicked', this.gridIndex);
    }
  }
})

// https://stackoverflow.com/a/29559488
const generateNumbers = (count) => ([...Array(count).keys()])

const minesweeperAppTemplate = `
  <div id="minesweeper-app">
    <h1 id="title">Minesweeper as a Service</h1>
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
    }
  },
  methods: {
    gridToIndex(x, y) {
      return y * this.width + x
    }
  }
})

const container = new Vue({
  el: '#container',
  data: {
    state: null
  },
  created() {
    EventBus.$on('tile-clicked', this.tileClicked)
  },
  mounted() {
    fetch(`${serviceLocation}/reset`).then((response) => {
      return response.json()
    }).then((state) => {
      // console.log('state', JSON.stringify(state)) // TODO: Remove
      document.getElementById('container').style.display = 'flex'
      this.state = state
    })
  },
  methods: {
    tileClicked(gridIndex) {
      const payload = {
        ...this.state,
        'pick-grid-index': gridIndex
      }
      fetch(`${serviceLocation}/pick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then((response) => {
        return response.json()
      }).then((state) => {
        // console.log('state', JSON.stringify(state)) // TODO: Remove
        this.state = state
      })
    }
  }
})

