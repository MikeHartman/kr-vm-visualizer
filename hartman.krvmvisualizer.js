(function( Hartman, undefined ) {

	Hartman.KRVMVisualizer = function (canvasElement, audioAnalyser, options) {

		var _ = this;

		_.canvasElement = canvasElement;
		_.audioAnalyser = audioAnalyser;
		_.options = Object.assign({
			barSpacing: 1,
			mirrorHoriz: true,
			mirrorVert: true,
			amplitudeMultiplier: 7,
			fadeRate: 0.5,
			showOrigin: false,
			backgroundColor: '#000000',
			barColor: '#FF0000',
			originColor: '#00FF00'
		}, options);

		_.canvasContext = _.canvasElement.getContext("2d");
		_.width = _.canvasElement.scrollWidth;
		_.height = _.canvasElement.scrollHeight;

		_.canvasContext.fillStyle = _.options.backgroundColor;
		_.canvasContext.fillRect(0, 0, _.width, _.height);

		_.bufferLength = _.audioAnalyser.frequencyBinCount;
		_.dataArray = new Uint8Array(_.bufferLength);

		_.barWidth = (_.width / _.bufferLength);
		if (_.options.mirrorHoriz) {
			_.barWidth = _.barWidth / 2;
		}

		_.draw();

		return _;

	};

	Hartman.KRVMVisualizer.prototype.constructor = Hartman.KRVMVisualizer;

	Hartman.KRVMVisualizer.prototype.setOptions = function(options) {

		var _ = this;

		_.options = Object.assign(_.options, options);

	}

	Hartman.KRVMVisualizer.prototype.draw = function() {

		var _ = this;

		if (typeof mikestop == "undefined") {
		requestAnimationFrame(_.draw.bind(_));
		}
		_.audioAnalyser.getByteFrequencyData(_.dataArray);
		
		_.canvasContext.save();
		_.canvasContext.globalAlpha = _.options.fadeRate;
		_.canvasContext.fillStyle = _.options.backgroundColor;
		_.canvasContext.fillRect(0, 0, _.width, _.height);
		_.canvasContext.restore();


		var originY = _.height;
		if (_.options.mirrorVert) {
			originY = _.height / 2;
		}

		var originX = 0;
		var trueOriginX = 0;
		if (_.options.mirrorHoriz) {
			trueOriginX = _.width / 2;
			originX = _.width / 2 - _.barWidth / 2;
		}

		var barHeight;
		var offsetX;
		var offsetY;
		var mx = originX;

		if (_.options.showOrigin) {

			_.canvasContext.save();
			_.canvasContext.globalAlpha = _.options.fadeRate;
			_.canvasContext.strokeStyle = _.options.originColor;
			_.canvasContext.moveTo(0, originY);
			_.canvasContext.lineTo(_.width, originY);
			_.canvasContext.stroke();
			_.canvasContext.moveTo(trueOriginX, 0);
			_.canvasContext.lineTo(trueOriginX, _.height);
			_.canvasContext.stroke();
			_.canvasContext.restore();

		}

		for (var i = 0; i < _.bufferLength; i++) {

			offsetX = (_.barWidth + _.options.barSpacing) * i;

			barHeight = _.dataArray[i]/100;
			barHeight = barHeight * barHeight * barHeight * barHeight * barHeight * _.options.amplitudeMultiplier;
			offsetY = barHeight;
			if (_.options.mirrorVert) {
				offsetY = offsetY / 2;
			}

			if (barHeight > 10) {

				_.canvasContext.fillStyle = _.options.barColor;
				_.canvasContext.fillRect(originX + offsetX , originY - offsetY, _.barWidth, barHeight);
				if (_.options.mirrorHoriz) {
					_.canvasContext.fillRect(originX - offsetX, originY - offsetY, _.barWidth, barHeight);
				}

			}

		}

	}

	return Hartman;


}( window.Hartman = window.Hartman || {} ));
