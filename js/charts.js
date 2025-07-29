var bullyStat = [];
var socmedUsage = [];
var chartInstance = null;
var cMin = 0;
var cMax = 0;

var scatterChart = null;

$(document).ready(function () {
    getWordCloud();
    getBullyStat();
    getSocmedUsage();
});

function getWordCloud(label = "nc") {
    // get word cloud data
    $.ajax({
        url: `${endpointRoot}/v2/charts/get_word_cloud`,
        method: 'GET',
        data: {
            label: label
        },
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (wordList) {
            $('#wordCloudCanvas').show();

            // draw wordcloud
            WordCloud(document.getElementById('wordCloudCanvas'), {
                list: wordList.data,
                gridSize: 24,
                weightFactor: 3,
                fontFamily: 'Arial',
                color: 'random-dark',
            });
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getBullyStat() {
    // get list of countries for combo box
    $.ajax({
        url: `${endpointRoot}/v2/charts/get_bully_stat_region_list`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            const select = $('#regionSelect');

            var data = response.data;

            // add combobox options using queried data
            data.forEach(region => {
                const option = $('<option>', {
                    value: region.code,
                    text: region.name
                });
                select.append(option);
            });

            // Important: refresh the Bootstrap Select UI
            select.selectpicker('refresh');
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });

    // get bullying statistics data for bar chart
    $.ajax({
        url: `${endpointRoot}/v2/charts/get_bully_stat`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            // data is loaded into variable to eliminate need for re-querying
            // everytime country selection changes
            bullyStat = response.data;

            // start with 3 countries pre-selected
            const allRegions = ['Indonesia', 'Malaysia', 'Singapore'];
            //const allRegions = [...new Set(bullyStat.map(d => d.country))]; // alternative for all countries selected

            // change combo box selections
            $('#regionSelect').selectpicker('val', allRegions);

            // draw bar chart
            updateBarChart(allRegions);
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getSocmedUsage() {
    // get social media usage data for scatter plot
    $.ajax({
        url: `${endpointRoot}/v2/charts/get_socmed_usage`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            socmedUsage = response.data;

        // draw scatter plot
        drawScatterPlot_v2('socmed');
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function updateBarChart(selectedRegions) {
    // filter data by selected countries
    const filtered = bullyStat.filter(item => selectedRegions.includes(item.country));

    const countries = filtered.map(d => d.country);
    const maleData = filtered.map(d => d.male_pct);
    const femaleData = filtered.map(d => d.female_pct);

    // If chart exists, update data
    if (chartInstance) {
        chartInstance.data.labels = countries;
        chartInstance.data.datasets[0].data = femaleData;
        chartInstance.data.datasets[1].data = maleData;
        chartInstance.update();
    } else {
        // Initial render
        const ctx = document.getElementById('barChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: countries,
                datasets: [
                    {
                        label: 'Female %',
                        data: femaleData,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)'
                    },
                    {
                        label: 'Male %',
                        data: maleData,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cyberbullying Percentages of Asean Countries'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentage of cyberbullying victims'
                        }
                    }
                }
            }
        });
    }
}

function getColorFromValue(value, min, max) {
    // Clamp value to expected range
    const clamped = Math.max(min, Math.min(max, value));

    // Normalize to [0, 1], where 0 = red, 1 = white
    const t = (clamped - min) / (max - min);

    // Interpolate: red stays at 255, green and blue go from 0 to 255
    const r = 255;
    const g = Math.round(255 * t);
    const b = Math.round(255 * t);

    return `rgb(${r}, ${g}, ${b})`;
}

// change box content when button is pressed
function switchBox() {
    const box1 = document.getElementById('box1');
    const box2 = document.getElementById('box2');

    // Copy height from box1 to box2
    box2.style.minHeight = box1.offsetHeight + 'px';
    box2.style.maxHeight = box1.offsetHeight + 'px';

    box1.classList.add('d-none');
    box2.classList.remove('d-none');
}

// update bar chart when combo box values change
$('#regionSelect').on('changed.bs.select', function () {
    const selectedRegions = $(this).val(); // Array of selected values
    updateBarChart(selectedRegions);
});

function checkCheckboxStatus() {
    if ($('#resp1').prop('checked') && $('#resp2').prop('checked') && $('#resp3').prop('checked')) {
        $('#btnResp').prop("disabled", false);
    } else {
        $('#btnResp').prop("disabled", true);
    }
}

function handleTabClick(name) {
    drawScatterPlot_v2(name);
}

function drawScatterPlot_v2(name) {
    var xAxisLabel = '';
    if (name == 'socmed') {
        xAxisLabel = 'Average Daily Social Media Usage (Hours)';
    } else if (name == 'sleep') {
        xAxisLabel = 'Sleep Hours per Night';
    }

    const xValues = socmedUsage.map(d => d['x_' + name]);
    const yValues = socmedUsage.map(d => d.y);

    const xMin = Math.ceil(Math.min(...xValues) - 1);
    const xMax = Math.floor(Math.max(...xValues) + 1);
    const yMin = Math.ceil(Math.min(...yValues) - 1);
    const yMax = Math.floor(Math.max(...yValues) + 1);

    const points = socmedUsage.map(item => ({
        x: item['x_' + name],
        y: item.y,
        backgroundColor: 'rgba(255, 0, 0, 1)',
        radius: 6
    }));

    var ctx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChart != null) {
        scatterChart.destroy();
    }

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Mental Health Score',
                data: points,
                parsing: false,
                showLine: false,
                pointBackgroundColor: points.map(p => p.backgroundColor),
                pointRadius: points.map(p => p.radius)
            }]
        },
        options: {
            scales: {
                x: {
                    min: xMin,
                    max: xMax,
                    title: {
                        display: true,
                        text: xAxisLabel
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Mental Health Score'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                }
            }
        }
    });
}