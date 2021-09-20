// @ts-check

import {
  APIWrapper,
  API_EVENT_TYPE
} from "./api.js";
import {
  addMessage,
  animateGift,
  isPossiblyAnimatingGift,
  isAnimatingGiftUI
} from "./dom_updates.js";

const api = new APIWrapper();

class Queue {
  constructor(list = []) {
    this.list = list
    this.shownIdList = []
    this.current = null
    this.timer = null
  }

  sort(list) {
    const sortedList = [...list]
    sortedList.sort(function (a, b) {
      if (a.type === API_EVENT_TYPE.ANIMATED_GIFT) return -1
      else return 1
    })
    return sortedList
  }

  show() {
    if (!this.current) return
    addMessage(this.current)
    console.log('this.current :>> ', this.current);
    this.current.type === API_EVENT_TYPE.ANIMATED_GIFT && animateGift(this.current)
    this.shownIdList.push(this.current.id)
  }

  change() {
    this.remove(this.current)
    this.current = this.list.find((event) => {
      if (event.type !== API_EVENT_TYPE.ANIMATED_GIFT) return true
      else if (!isPossiblyAnimatingGift() && !isAnimatingGiftUI()) return true
      else return false
    })
    this.show()
  }

  isAllreadyShown(item) {
    return this.shownIdList.some(id => id === item.id)
  }

  handleList() {
    let now = new Date();
    this.list = this.list.filter(item => !this.isAllreadyShown(item) || (item.type === API_EVENT_TYPE.MESSAGE && now - item.timestamp < 20000))
  }

  start(newList = []) {
    const sortedList = this.sort(newList)
    this.list = [...this.list, ...sortedList]
    if (this.timer) return

    this.timer = setInterval(() => {
      this.handleList()
      if (!this.list.length) return stop()
      this.change()
    }, 500);
  }

  stop() {
    clearInterval(this.timer)
  }

  remove(item) {
    if (!item) return
    const index = this.list.findIndex(item => item.id === item.id)
    this.list.splice(index, 1);
  }
}
const showQueue = new Queue()

api.setEventHandler((events) => {
  showQueue.start(events)
})

// NOTE: UI helper methods from `dom_updates` are already imported above.