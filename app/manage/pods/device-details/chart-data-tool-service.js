'use strict';

var angular = require('angular');
var _ = require('lodash');
var Promise = require('bluebird');

module.exports = [
  'AqiData',
  'TimeSeries',
  'basicChartConfig',
  'aqiChartConfig',
  'sensorChartConfig',
  function(
    AqiData,
    TimeSeries,
    basicChartConfig,
    aqiChartConfig,
    sensorChartConfig
  ) {
    function loadDataSource(options) {
      var deviceId = options.deviceId;
      var sensor = options.sensor;
      return Promise.resolve()
        .then(function() {
          if (sensor === 'aqi') {
            return AqiData.getHistory()
              .then(function(data) {
                var actData = {};
                var latestCategory = null;
                var maxCategory = null;
                var minValue = null;
                var maxValue = null;

                actData.data = data.map(function(item, i) {
                  if (!minValue) {
                    minValue = item.time;
                  }
                  var actCategory = AqiData.categoryByValue(item.value);
                  var actValue = {
                    value: item.value,
                    anchorBorderColor: actCategory.color,
                  };
                  if (latestCategory == null || latestCategory !== actCategory) {
                    if (!maxCategory || maxCategory.level < actCategory.level) {
                      maxCategory = actCategory;
                    }
                    latestCategory = actCategory;
                  }
                  maxValue = item.time;
                  return actValue;
                });

                if (!actData.chart) {
                  actData.chart = {};
                }
                if (maxCategory) {
                  actData.chart.plotgradientcolor = maxCategory.color;
                  actData.chart.yaxismaxvalue = maxCategory.threshold;
                }
                actData.chart.xaxisname =
                  'Between ' + new Date(minValue) + ' and ' + new Date(maxValue);
                return actData;
              });
          }

          return TimeSeries.getSensorHistory(deviceId, sensor)
            .then(function(data) {
              return {
                data: data.map(function(item) {
                  return {
                    value: item.numericValue
                  };
                }),
              };
            });
        });
    }

    // Per-sensor constraints.
    var sensorValues = {
      co: {
        min: 0,
        max: 500,
        initial: 25,
        wiggle: 0.01
      },
      dust: {
        min: 0,
        max: 500,
        wiggle: 0.01,
        initial: 1
      },
      humidity: {
        min: 0,
        max: 100,
        wiggle: 0.03,
        initial: 20
      },
      temp: {
        min: -40,
        max: 125,
        wiggle: 0.02,
        initial: 26
      },
      aqi: {
        min: 0,
        max: 100,
        wiggle: 0.02,
        initial: 20,
      }
    };

    function sensorValue(current, options) {
      var result = current ?
        (options.max - options.min) * options.wiggle * _.sample([1, -1]) + current.value :
        options.initial;

      // Ensure current value falls within min and max range.
      return Math.min(options.max, Math.max(options.min, _.round(result)));
    }

    function generateSensorData(sensor, data) {
      var result = data ? data : [];
      var amountToGenerate = 100 - result.length;
      var options = sensorValues[sensor];

      while (amountToGenerate) {
        result.push({
          value: sensorValue(result[result.length - 1], options)
        });
        --amountToGenerate;
      }

      return result;
    }

    return {
      baseChartData: function(options) {
        return angular.merge({},
          basicChartConfig, {
            dataSource: options.sensor === 'aqi' ? aqiChartConfig : sensorChartConfig
          }
        );
      },

      loadDataSource: loadDataSource,
      generateSensorData: generateSensorData
    };
  },
];
