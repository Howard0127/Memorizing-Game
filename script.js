let pcPlay = undefined
const body = document.querySelector('body')
const pcPlayBtn = document.querySelector('.pc-play')
const resetBtn = document.querySelector('.reset')


const GAME_STATE ={
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardMatched: 'CardMatched',
  GameFinished: 'GameFinished'
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


const view = {
  getCardElement(index) { 
    return `<div class="card back not-flipped" data-index="${index}"></div>`
  },
  
  getCardContent(index) {
    const number = this.transformNumber(index % 13 + 1)
    const symbolIndex = Math.floor(index / 13)
    const symbol = Symbols[symbolIndex]
      return `
      <p>${number}</p>
        <img src= ${symbol} alt="" />
      <p>${number}</p>
    `
  },

  flipCards(...cards) {
    cards.map(card => {
    if(card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    card.classList.add('back')
    card.innerHTML = null
    })
  },

  transformNumber(number) {
    switch(number) {
      case(1):
        return 'A'
      case(11):
        return 'J'
      case(12):
        return 'Q'
      case(13):
        return 'K'
      case(number):
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index, 0)).join('')
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

  renderScoreMinus() {
    document.querySelector('.score').innerText = `Score -1!`
  },

  appendMinusAnimation() {
    const score = document.querySelector('.score')
    this.renderScoreMinus()
    score.classList.add('minus')
    score.addEventListener('animationend', e => {
    view.renderScore(model.score)
    e.target.classList.remove('minus'), {once: true}
    })
  },

  renderTimer(seconds) {
    document.querySelector('.timer').innerText = `Time Passing: ${seconds}s`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => 
      e.target.classList.remove('wrong'), {once: true})
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!!</p>
      <p>Score: ${model.score}</p>
      <p>Time Used: ${model.seconds} seconds</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction (card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        if (model.triedTimes === 0) {
          model.countSecond()
        }
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards.map(card => card.classList.remove('flipped'))
          model.revealedCards = []
          if (model.score + Math.floor(model.seconds / 10) === 260) {
            this.currentState = GAME_STATE.GameFinished
            model.countSecond()
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          // model.revealedCards.map(card => card.classList.add('flipped'))
          model.revealedCards[1].classList.add('flipped')
          setTimeout(this.resetCards, 1300)
        }
        break
    }
    console.log(this.currentState)
    console.log(model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0,
  
  seconds: 0,
  
  countSecond() {   
    let int = setInterval(counting, 1000)
    function counting () {

      if(controller.currentState === 'GameFinished') {
      clearInterval(int)
      return
      }  

      model.seconds++
      view.renderTimer(model.seconds)

      if (model.seconds % 10 === 0 && model.seconds !== 0) {
        model.score--
        view.appendMinusAnimation()
      }

    }
  },
}

controller.generateCards()


document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    console.log(card)
    card.classList.add('flipped')
    card.classList.remove('not-flipped')
    controller.dispatchCardAction(card)
  })
})


resetBtn.addEventListener('click', () => {
  location.reload()
})



/////////////////////////////pc-play/////////////////////////////
pcPlayBtn.addEventListener('click', (e) => {
   body.classList.toggle('pc-playing')
   const target = e.target
   if (target.matches('.active')) {
    target.innerText = 'Stop PC Playing'
    target.classList.remove('active', 'btn-info')
    target.classList.add('btn-danger')
    autoPlay()

   } else {
    target.innerText = 'PC Play'
    target.classList.remove('btn-danger')
    target.classList.add('active', 'btn-info')
    clearInterval(pcPlay)
   }
})


function randomNum(array) {
  return Math.floor(Math.random() * array.length)
}

function autoPlay() {
  pcPlay = setInterval(() => {
    const notFlippedArr = Array.from(document.querySelectorAll('.not-flipped'))
    const flippedCardsArr = Array.from(document.querySelectorAll('.flipped'))
    //遊戲開頭，所有的牌會在[沒翻過陣列]
    //開始遊戲後，所有的蓋牌分別放置在[有翻過]和[沒翻過]的兩個陣列。
    //每次翻的第一張都從[沒翻過陣列]去找，然後核對[翻過陣列]的牌，有找到的話配對成功，這兩張牌離開這兩個陣列；
    //沒找到的話，再隨機從[沒翻過陣列]翻牌配對，配對成功，這兩張牌離開[沒翻過陣列]；配對失敗，這兩張牌加入[翻過陣列]
    //當[沒翻過陣列]沒有牌了，也就是所有牌都翻過一遍，且遊戲還沒結束，
    //則從[翻過陣列]隨機抽第一張，再從同陣列配對一樣的牌，這兩張牌離開[翻過陣列]，直到遊戲結束。
    switch (controller.currentState) {
        case GAME_STATE.FirstCardAwaits:
          if (notFlippedArr.length > 0) {
            const card1 = notFlippedArr[randomNum(notFlippedArr)]
            card1.classList.remove('not-flipped')
            controller.dispatchCardAction(card1)
          } else {
            const card1 = flippedCardsArr[randomNum(flippedCardsArr)]
            controller.dispatchCardAction(card1)
          }
          break

        case GAME_STATE.SecondCardAwaits:
          model.revealedCards[0].classList.add('flipped')
          const card1Num = Number(model.revealedCards[0].dataset.index) % 13
          if (flippedCardsArr.some(card => Number(card.dataset.index) % 13 === card1Num)) {
            
            if(flippedCardsArr.some(card => card.dataset.index === model.revealedCards[0].dataset.index)) {
              const position = flippedCardsArr.findIndex(card => card.dataset.index === model.revealedCards[0].dataset.index)
              flippedCardsArr.splice(position, 1)
              const position2 = flippedCardsArr.findIndex(card => Number(card.dataset.index) % 13 === card1Num)
              controller.dispatchCardAction(flippedCardsArr[position2])
            }
            
            const flippedCardPosition = flippedCardsArr.findIndex(card => Number(card.dataset.index) % 13 === card1Num)
            controller.dispatchCardAction(flippedCardsArr[flippedCardPosition])
                
          } else if (notFlippedArr.length > 0) {
            const card2 = notFlippedArr[randomNum(notFlippedArr)]
            card2.classList.add('flipped')
            card2.classList.remove('not-flipped')
            controller.dispatchCardAction(card2)
          } 
          break

        case GAME_STATE.GameFinished:
          pcPlayBtn.innerText = 'PC Play'
          pcPlayBtn.classList.remove('btn-danger')
          pcPlayBtn.classList.add('active', 'btn-info')
          body.classList.remove('pc-playing')
          clearInterval(pcPlay)
          break
          
      }
  }, 2000)
}



