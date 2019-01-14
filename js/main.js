$(document).ready(function () {
    window.dates = getAllDates();
    $('#datepicker').datepicker({dateFormat: 'yy-mm-dd', beforeShowDay: available});

    // Colors to use for chart
    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };

    // Structure to store chart values
    apiData = {'labels': [], 'values': []};

    // Chart config
    var chartConfig = {
        type: 'line',
        data: {
            labels: apiData.labels,
            datasets: [{
                label: 'Nombre de personnes',
                backgroundColor: window.chartColors.blue,
                borderColor: window.chartColors.blue,
                data: apiData.values,
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Fiyeli voila'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    var ctx = document.getElementById('canvas').getContext('2d');
    window.ownChart = new Chart(ctx, chartConfig);


    // Initial values for chart
    $.ajax({
        url: "http://localhost:5000/stats/2019-01-11"
    }).then(function (data) {
        $.each(data, function (key, value) {
            // We convert timestamp to date
            apiData.labels[key] = moment(parseInt(value[0]) * 1000).format("YYYY-MM-DD, HH:MM:ss");
            apiData.values[key] = value[1];
        });
        window.ownChart.update();

    });

    // Date selector handler
    $('#selectDate').click(function (event) {
        event.preventDefault();
        getDataForOneDate($('#datepicker').val(), apiData);
    });
});

function getAllDates() {
    var dates = [];
    $.ajax({
        url: "http://localhost:5000/stats"
    }).then(function (data) {
        $.each(data, function (key, value) {
            $.each(value, function (dummyKey, apiUrl) {
                dates.push(moment(apiUrl.split('/')[2]).format("YYYY-MM-DD"));
            })
        })
    });
    return dates
}

function available(date) {
    momentDate = moment(date).format("YYYY-MM-DD");
    if ($.inArray(momentDate, window.dates) != -1) {
        return [true]
    }
    return [false]
}

function getDataForOneDate(date, apiData) {
    momentDate = moment(date, "YYYY-MM-DD");
    // Empty existing data
    apiData.labels = [];
    apiData.values = [];

    $.ajax({
        url: "http://localhost:5000/stats/" + momentDate.format('YYYY-MM-DD')
    }).then(function (data) {
        $.each(data, function (key, value) {
            // We convert timestamp to date
            apiData.labels.push(moment(parseInt(value[0]) * 1000).format("YYYY-MM-DD, HH:MM:ss"));
            apiData.values.push(value[1]);
        });
        changeChartData(window.ownChart, apiData.labels, apiData.values);
    });
}

function changeChartData(chart, labels, newData) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = newData;
    chart.update();
}