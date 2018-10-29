const serviceLocation = location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://minesweeper-as-a-service.herokuapp.com'

const containsPair = (x, y, pairs) => (pairs.some(pair => (pair[0] === x && pair[1] === y)))

// https://stackoverflow.com/a/29559488
const generateNumbers = (count) => ([...Array(count).keys()])

const gridTileTemplate = `
  <div class="grid-tile">{{ marker }}</div>
`

Vue.component('grid-tile', {
  props: ['x', 'y', 'mines'],
  computed: {
    marker() {
      if (containsPair(this.x, this.y, this.mines)) {
        return 'X'
      } else {
        return ''
      }
    }
  },
  template: gridTileTemplate
})

const minesweeperAppTemplate = `
  <div id="minesweeper-app">
    <h1 id="title">Minesweeper as a Service</h1>
    <div>
      <table id="playing-field">
        <tbody>
          <tr v-for="y in boardHeight">
            <td v-for="x in boardWidth">
              <grid-tile v-bind:x="x"
             v-bind:y="y"
             v-bind:mines="mines">
              </grid-tile>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  <div>
`

Vue.component('minesweeper-app', {
  props: ['state'],
  computed: {
    boardWidth() {
      return this.state ? generateNumbers(this.state['board-width']) : 0
    },
    boardHeight() {
      return this.state ? generateNumbers(this.state['board-height']): 0
    },
    mines() {
      return this.state ? this.state['mines'] : []
    }
  },
  template: minesweeperAppTemplate
})

const container = new Vue({
  el: '#container',
  data: {
    state: null
  },
  mounted() {
    fetch(`${serviceLocation}/reset`).then((response) => {
      return response.json()
    }).then((state) => {
      // TODO: Is there a better way to prevent render before template is filled in?
      document.getElementById('container').style.display = 'flex'
      console.log('state', JSON.stringify(state))
      this.state = state
    })
  },
})

