// initialize vars
var gStartTime = new Date(0);
var gEndTime = new Date(0);
var div = "chart";
var chart, data;
var self = this;
var file = "http://localhost/NepalOSMHistory/NepalOSMHistory/data/sampledaily/activity.csv";

$(document).ready(function () {
	var done = false;
    var dchart = new Dygraph(
        document.getElementById(div),
        file,
        {
            labelsKMG2: true,
			showRoller: true,
            customBars: false,
            legend: 'always',
            labelsDivStyles: { 'textAlign': 'right' },
            showRangeSelector: true,
            rangeSelectorHeight: 30,
            axisLabelFontSize: 11,
            drawCallback: function() {
	            done = true;
            },
            zoomCallback: function(minDate, maxDate, yRanges) {
	            if (done) {
		            gStartTime = new Date(minDate);
					gEndTime = new Date(maxDate);
					self.date_range_change(gStartTime, gEndTime);
					done = false;
	            }
  			}
            // http://dygraphs.com/options.html
        }
    );
});