'use strict';

/* Services */
angular.module('snake.services', [])
	/* Options service. All initial game values are coming from here. */
	.service('Options', [ function () {
		return {
			/* Game difficulty. */
			difficulty: 4,
			/* Snake cell sizes. Used to calculate playground size. */
			cellWidth: 10,
			cellHeight: 10,
			cellMargin: 1,
			/* Initial snake head position. Value is negative to prevent empty space on left side. */
			initialSnakePosX: -10,
			initialSnakePosY: 0,
			/* Initial snake direction */
			snakeInitialDirection: 'right',
			/* Number of scores to save in localStorage */
			savedHighScores: 10,
			/* Playground margins */
			playgroundSideMargin: 50,
			playgroundTopMargin: 75
		};
	}])

	/* Storage service. Provides 'setScore' and 'getScores' methods to work with localStorage. */
	.service('Storage', [ '$window', 'Options', function ($window, Options) {
		return {
			/* Method to save scores in localStorage. */
			setScore: function (score) {
				/* Array of scores in localStorage */
				var scores = this.getScores();
				/*
				 * If count of scores in localStorage less or equals to max allowed number (defined in options)
				 */
				if (scores.length <= Options.savedHighScores) {
					/* push current score into array */
					scores.push(score);
					/* sort array */
					scores.sort(function (a, b) {
						return b - a;
					});
					/* If scores count bigger than max allowed (can't be bigger than max allowed + 1)
					 * then remove last score from array
					 */
					if (scores.length > Options.savedHighScores) {
						/* delete last value from array */
						scores.pop();
					}
					/* Built in not most optimal way, but I've decided that this is enough for so small array.
					 * No need to implement binary search in this situation.
					 */
				}
				/* Write scores into localStorage. */
				$window.localStorage && $window.localStorage.setItem('scores', JSON.stringify(scores));
			},

			/* Method to get scores from local Storage. Always returns an array. */
			getScores: function () {
				var scores = $window.localStorage && $window.localStorage.getItem('scores');
				if (scores) {
					return JSON.parse(scores);
				} else {
					return [];
				}
			}
		};
	}])

	/* Storage service. Provides 'setScore' and 'getScores' methods to work with localStorage. */
	.service('Events', [ '$document', '$window', 'Options', function ($document, $window, Options) {
		var events = {
			/* Events data object */
			data: {
				snakeDirection: Options.snakeInitialDirection,
				waitingForNewDirection: false
			},

			/* Touches data object */
			touches: {
				'touchstart': {'x': -1, 'y': -1},
				'touchmove': {'x': -1, 'y': -1},
				'touchend': false,
				'direction': Options.snakeInitialDirection
			},

			/* Handle events to control snake. */
			eventHandler: function (event) {
				/* Touch events. */
				if (event.type.indexOf('touch') === 0) {
					event.preventDefault();
					event = event.originalEvent;
					var touch = event.touches[0];
					var touches = this.touches;
					switch (event.type) {
						case 'touchstart':
						case 'touchmove':
							touches[event.type].x = touch.pageX;
							touches[event.type].y = touch.pageY;
							break;
						case 'touchend':
							events.touches[event.type] = true;
							var swipeX = touches.touchstart.x - touches.touchmove.x;
							var swipeY = touches.touchstart.y - touches.touchmove.y;
							if (Math.abs(swipeX) > Math.abs(swipeY)) {
								touches.direction = swipeX > 0 ? 'left' : 'right';
							} else {
								touches.direction = swipeY > 0 ? 'up' : 'down';
							}
							this.setDirection(touches.direction);
					}
				/* Mouse events */
				} else {
					switch (event.which) {
						case 37:
							return this.setDirection('left');
						case 38:
							return this.setDirection('up');
						case 39:
							return this.setDirection('right');
						case 40:
							return this.setDirection('down');
					}
				}
			},

			/* Method to check for opposite direction event. */
			checkOppositeDirection: function (od, nd) {
				if ((od === 'up' && nd === 'down') || (od === 'down' && nd === 'up') || (od === 'right' && nd === 'left') || (od === 'left' && nd === 'right')) {
					return true;
				}
			},

			/* Set snake direction */
			setDirection: function (newDirection) {
				var oldDirection = this.data.snakeDirection;
				var waitingForNewDirection = this.data.waitingForNewDirection;
				/* Ignore direction change if opposite direction event triggered. Checking if snake 'waiting' for direction change. */
				if (!this.checkOppositeDirection(oldDirection, newDirection) && waitingForNewDirection) {
					this.data.snakeDirection = newDirection;
					this.data.waitingForNewDirection = false;
				}
			},
			/* Initialize mouse and touch events */
			init: function () {
				$($window).scrollTop(0);
				$($document).on('keydown touchstart.playground touchmove.playground touchend.playground', function (event) {
					events.eventHandler(event);
				});
			},
			/* Deinitialize mouse and touch events */
			deinit: function () {
				$($document).off('touchstart.playground touchmove.playground touchend.playground')
			}
		};
		return events;
	}]);