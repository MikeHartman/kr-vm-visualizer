(function( Hartman, undefined ) {

	Hartman.KRVMVisualizer = function (canvasElement, audioAnalyser, options) {

		var _ = this;

		_.canvasElement = canvasElement;
		_.audioAnalyser = audioAnalyser;
		_.options = Object.assign({
			barSpacing: 1,
			mirrorHoriz: true,
			mirrorVert: true,
			biteMode: false,
			amplitudeMultiplier: 1,
			compressionFactor: 1,
			threshold: 10,
			fadeRate: 0.5,
			showAxes: false,
			backgroundColor: '#000000',
			barColor: '#FF0000',
			axisColor: '#00FF00'
		}, options);

		_.canvasContext = _.canvasElement.getContext("2d");

		_.bufferLength = _.audioAnalyser.frequencyBinCount;
		_.dataArray = new Uint8Array(_.bufferLength);

		_.recalculateDimensions();

		_.resetCanvas();

		_.draw();

		return _;

	};

	Hartman.KRVMVisualizer.prototype.constructor = Hartman.KRVMVisualizer;

	Hartman.KRVMVisualizer.prototype.recalculateDimensions = function() {

		var _ = this;

		_.width = _.canvasElement.scrollWidth;
		_.height = _.canvasElement.scrollHeight;

		_.barWidth = (_.width / _.bufferLength);
		if (_.options.mirrorHoriz) {
			_.barWidth = _.barWidth / 2;
		}
		_.barWidth = Math.floor(_.barWidth);

		_.originY = _.height;
		if (_.options.mirrorVert) {
			_.originY = Math.floor(_.height / 2);
		}

		_.originX = 0;
		_.displayOriginX = 0;
		if (_.options.mirrorHoriz) {
			// We're starting in the center, but we want the first bar to be centered on that line,
			// so top left corner needs to be offset 1/2 the bar width to the left
			_.displayOriginX = Math.floor(_.width / 2);
			_.originX = Math.floor(_.width / 2 - _.barWidth / 2);
		}

		_.resetCanvas();
		
	}

	Hartman.KRVMVisualizer.prototype.setOptions = function(options) {

		var _ = this;

		_.options = Object.assign(_.options, options);

		_.recalculateDimensions();

	}

	Hartman.KRVMVisualizer.prototype.resetCanvas = function(alpha) {

		var _ = this;

		alpha = (typeof alpha === 1.0) ? 'default' : alpha;

		// reset the background
		_.canvasContext.save();
		_.canvasContext.globalAlpha = alpha;
		_.canvasContext.fillStyle = _.options.backgroundColor;
		_.canvasContext.fillRect(0, 0, _.width, _.height);
		_.canvasContext.restore();

		if (_.options.showAxes) {

			_.canvasContext.save();
			_.canvasContext.globalAlpha = alpha;
			_.canvasContext.strokeStyle = _.options.axisColor;
			_.canvasContext.moveTo(0, _.originY);
			_.canvasContext.lineTo(_.width, _.originY);
			_.canvasContext.stroke();
			_.canvasContext.moveTo(_.displayOriginX, 0);
			_.canvasContext.lineTo(_.displayOriginX, _.height);
			_.canvasContext.stroke();
			_.canvasContext.restore();

		}

	}

	Hartman.KRVMVisualizer.prototype.checkForCanvasSizeChange = function() {

		var _ = this;

		if (_.canvasElement.scrollWidth !== _.width || _.canvasElement.scrollHeight !== _.height) {
			_.recalculateDimensions();
		}

	}

	Hartman.KRVMVisualizer.prototype.draw = function() {

		var _ = this;

		_.checkForCanvasSizeChange();

		requestAnimationFrame(_.draw.bind(_));
		_.audioAnalyser.getByteFrequencyData(_.dataArray);

		var barHeight;
		var offsetX;

		_.resetCanvas(_.options.fadeRate);

		for (var i = 0; i < _.bufferLength; i++) {

			offsetX = (_.barWidth + _.options.barSpacing) * i;

			// values in dataArray are in the range 0-255

			var heightScalingFactor = _.height / Math.pow(255, _.options.compressionFactor);
			barHeight = Math.floor((Math.pow(_.dataArray[i], _.options.compressionFactor)) * heightScalingFactor * _.options.amplitudeMultiplier);

			if (_.options.mirrorVert) {
				barHeight = Math.floor(barHeight / 2);
			}

			if (barHeight > _.options.threshold) {

				_.canvasContext.fillStyle = _.options.barColor;
				if (_.options.biteMode && i % 2 == 1) { // draw from top and bottom
					_.drawBar(_.originX + offsetX, 0, _.barWidth, barHeight);
					if (_.options.mirrorVert) {
						_.drawBar(_.originX + offsetX, _.height - barHeight, _.barWidth, barHeight);
					}
				} else { // draw from origin
					_.drawBar(_.originX + offsetX , _.originY - barHeight, _.barWidth, barHeight);
					if (_.options.mirrorVert) {
						_.drawBar(_.originX + offsetX , _.originY, _.barWidth, barHeight);
					}
				}

				if (_.options.mirrorHoriz) {
					if (_.options.biteMode && i % 2 == 1) { // draw from top and bottom
						_.drawBar(_.originX - offsetX, 0, _.barWidth, barHeight);
						if (_.options.mirrorVert) {
							_.drawBar(_.originX - offsetX, _.height - barHeight, _.barWidth, barHeight);
						}
					} else { // draw from origin
						_.drawBar(_.originX - offsetX, _.originY - barHeight, _.barWidth, barHeight);
						if (_.options.mirrorVert) {
							_.drawBar(_.originX - offsetX, _.originY, _.barWidth, barHeight);
						}
					}
				}

			}

		}

	}

	Hartman.KRVMVisualizer.prototype.drawBar = function(x, y, w, h) {

		var _ = this;

		_.canvasContext.fillRect(x, y, w, h);

	}

	return Hartman;


}( window.Hartman = window.Hartman || {} ));
