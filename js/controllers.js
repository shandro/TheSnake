'use strict';

/* Controllers */
angular.module('snake.controllers', [])
	/* Main 'The Snake' game controller. All game logic is here. */
	.controller('mainController', [
		'$scope', '$interval', '$timeout', 'Options', 'Storage', 'Events', function ($scope, $interval, $timeout, Options, Storage, Events) {
			/* Include game options to scope. */
			$scope.options = Options;
			/* Hide Navigation block. */
			$scope.isNavVisible = true;
			/* Hide Countdown block. */
			$scope.isCountdownVisible = false;
			/* Initially game is not started, so, hiding current game score.  */
			$scope.roundInProgress = false;
			/* Snake is empty. */
			$scope.snake = [];
			/* While game not started we're using snake direction from game options. */
			Events.data.waitingForNewDirection = false;
			$scope.snakeDirection = $scope.options.snakeInitialDirection;
			/* Set snake head to initial position. */
			$scope.snakeHeadPosition = {
				x: $scope.options.initialSnakePosX,
				y: $scope.options.initialSnakePosY
			};

			/*
			 * Method to define next snake cell position depending on direction that we got from 'playground' directive.
			 * It returns next cell's coordinates.
			 */
			function newSnakeCell() {
				switch (Events.data.snakeDirection) {
					case 'right':
						return {
							x: $scope.snakeHeadPosition.x + $scope.options.cellWidth + $scope.options.cellMargin,
							y: $scope.snakeHeadPosition.y
						};
					case 'left':
						return {
							x: $scope.snakeHeadPosition.x - $scope.options.cellWidth - $scope.options.cellMargin,
							y: $scope.snakeHeadPosition.y
						};
					case 'up':
						return {
							x: $scope.snakeHeadPosition.x,
							y: $scope.snakeHeadPosition.y - $scope.options.cellHeight - $scope.options.cellMargin
						};
					case 'down':
						return {
							x: $scope.snakeHeadPosition.x,
							y: $scope.snakeHeadPosition.y + $scope.options.cellHeight + $scope.options.cellMargin
						};
				}
			}

			/*
			 * Method to check if next cell is available (no playground border or snake's tail).
			 * It returns boolean value.
			 */
			function nextCellAvailable() {
				var cellAvailable = true;
				var newSnakeCellX = newSnakeCell().x;
				var newSnakeCellY = newSnakeCell().y;

				/* Check if there is no border on X-axis. */
				if (Math.floor(newSnakeCellX / ($scope.options.cellWidth + $scope.options.cellMargin)) === $scope.maxAvailabeCells.x || newSnakeCellX < 0) {
					return cellAvailable = false;
				}

				/* Check if there is no border on Y-axis. */
				if (Math.floor(newSnakeCellY / ($scope.options.cellHeight + $scope.options.cellMargin)) === $scope.maxAvailabeCells.y || newSnakeCellY < 0) {
					return cellAvailable = false;
				}

				/* Walking thru all snake's cells. If next cell is busy by existing one it means that snake hits its own tail. */
				angular.forEach($scope.snake, function (cell) {
					if (cell.x === newSnakeCellX && cell.y === newSnakeCellY) {
						return cellAvailable = false;
					}
				});
				return cellAvailable;
			}

			/*
			 * Start The Snake.
			 */
			$scope.snakeStart = function () {
				/* Initialize events */
				Events.init();
				/* Hide Navigation block. */
				$scope.isNavVisible = false;
				/* Show Countdown. */
				$scope.isCountdownVisible = true;
				/* Reset Snake to initial state. */
				$scope.snakeReset();
				/* Wait 4 seconds to finish countdown. */
				return $timeout(function () {
					/* Hide countdown. */
					$scope.isCountdownVisible = false;
					/* Game in progress. Showing current score on top of the page. */
					$scope.roundInProgress = true;
					/* Since game started, now we're looking for new new snake's direction. */
					Events.data.waitingForNewDirection = true;
					var snakeAddCell = $interval(function () {
						/* Grow up the snake and update head position if next cell available. */
						if (nextCellAvailable()) {
							var newCell = newSnakeCell();
							$scope.snake.push(newCell);
							$scope.snakeHeadPosition.x = newCell.x;
							$scope.snakeHeadPosition.y = newCell.y;
							Events.data.waitingForNewDirection = true;
						} else {
							/* If next cell is unavailable finishing current game. Updating 'play' button state, writing score to localStorage. */
							$scope.roundFailed = true;
							$scope.roundScore = $scope.snake.length;
							$scope.isNavVisible = true;
							$scope.roundInProgress = false;
							/* Deinitialize events */
							Events.deinit();
							$interval.cancel(snakeAddCell);
							Storage.setScore($scope.roundScore);
						}
						/* Interval delay for drawing next cell. Half second divided by difficulty level. */
					}, 500 / $scope.options.difficulty);
				}, 4000);
			};

			/* Method to reset snake to initial states. */
			$scope.snakeReset = function () {
				$scope.snake = [];
				$scope.snakeDirection = $scope.options.snakeInitialDirection;
				$scope.snakeHeadPosition = {
					x: $scope.options.initialSnakePosX,
					y: $scope.options.initialSnakePosY
				};
				Events.data .snakeDirection = 'right';
			};

			/* Method to get top scores from localStorage. */
			$scope.scores = function () {
				return Storage.getScores();
			};

			/* Get current game score. */
			$scope.currentScore = function () {
				return $scope.snake.length;
			};

			/* Method to show/hide additional blocks (options and scores) in Navigation block. */
			$scope.showAdditionalBlock = function (blockName) {
				if (blockName === 'options') {
					$scope.gameOptionsVisible = !$scope.gameOptionsVisible;
					$scope.highScoresVisible = false;
				}
				if (blockName === 'scores') {
					$scope.highScoresVisible = !$scope.highScoresVisible;
					$scope.gameOptionsVisible = false;
				}
			};

			/* Set initial difficulty slider handler position depending on default difficulty value. */
			$scope.difficultySliderPercent = function () {
				return $scope.options.difficulty * 10;
			};
		}
	]);