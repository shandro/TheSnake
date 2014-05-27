'use strict';

/* Directives */
angular.module('snake.directives', [])

	/* Playground directive used to resize playground size. */
	.directive('playground', ['$window', '$document', 'Options', function ($window, $document, Options) {
		return {
			restrict: 'C',
			link: function (scope, el) {
				var win = $($window);
				var doc = $($document);

				/* Set playground size to fill exact amount of snake parts (cells). */
				var setPlaygroundSize;
				(setPlaygroundSize = function () {
					var winWidth = win.outerWidth();
					var winHeight = win.outerHeight();

					/* Calculate max available cells that playground can fill. */
					scope.maxAvailabeCells = {
						x: Math.floor((winWidth - Options.playgroundSideMargin) / (Options.cellWidth + Options.cellMargin)),
						y: Math.floor((winHeight - Options.playgroundTopMargin) / (Options.cellHeight + Options.cellMargin))
					};

					/* Set playground size. */
					el.css({
						width: scope.maxAvailabeCells.x * (Options.cellWidth + Options.cellMargin) + Options.cellMargin,
						height: scope.maxAvailabeCells.y * (Options.cellHeight + Options.cellMargin) + Options.cellMargin
					});

					/* Vertical align countdown. */
					$('.countdown span', el).css({
						'padding-top': (scope.maxAvailabeCells.y * Options.cellHeight + Options.cellMargin) / 2
					});
				})();

				/* Resize playground and reset snake on window resize. */
				win.on('resize orientationchange', function () {
					setPlaygroundSize();
					scope.snakeReset();
				});
			}
		};
	}])

	/* Directive to handle difficulty slider in game options. */
	.directive('slider', ['Options', function (Options) {
		return {
			restrict: 'C',
			link: function (scope, el) {

				/* Difficulty slider handler element. */
				var handler = $('.handler', el);

				/* Get slide data from events. */
				var getDataFromEvent = function (ev) {
					/* Touch events. */
					if (ev.type.indexOf('touch') === 0) {
						if ((ev.originalEvent.touches != null) && ev.originalEvent.touches.length > 1) {
							return null;
						}
						return {
							x: ev.originalEvent.touches[0].pageX,
							y: ev.originalEvent.touches[0].pageY
						};
					} else {
						/* Mouse events. */
						return {
							x: ev.pageX,
							y: ev.pageY
						};
					}
				};

				/* Set difficulty slider handler position. Apply difficulty value to main scope. */
				function setPercentFromEvent(ev) {
					var data = getDataFromEvent(ev);
					var sliderWidth = el.width();
					var sliderLeft = el.offset().left;
					var percent = 100 * (data.x - sliderLeft) / sliderWidth;
					if (percent < 0) {
						percent = 0;
					}
					if (percent > 100) {
						percent = 100;
					}
					scope.sliderPercent = percent;
					Options.difficulty = Math.floor(scope.sliderPercent / 11) + 1;
					scope.difficultySliderPercent = function () {
						return scope.sliderPercent;
					};
					/* Run digest cycle. */
					if (!(scope.$$phase || scope.$root.$$phase)) {
						return scope.$apply();
					}
				}

				/* Set difficulty handler position when user clicks somewhere in slider bar */
				el.on('click', setPercentFromEvent);

				/* Set difficulty handler position on mouse and touch events */
				handler.on('mousedown touchstart', function (event) {
					event.preventDefault();
					$(document.body).on({
						'mousemove.handler touchmove.handler': setPercentFromEvent,

						/* Fire mouse and touch events on mouseup and touchend */
						'mouseup.handler touchend.handler': function () {
							$(this).off('.handler');
						}
					});
				});
			}
		}
	}]);