//var endpointRoot = "http://localhost:5000/api";
var endpointRoot = "https://childcybercare.duckdns.org/api";

var bullyStat = [];
var socmedUsage = [];
var chartInstance = null;

$(document).ready(function () {
    getWordCloud();
    getBullyStat();
    getSocmedUsage();
});

function getWordCloud() {
    $.getJSON(`${endpointRoot}/get_word_cloud`, function (wordList) {
        $('#wordCloudCanvas').show();

        WordCloud(document.getElementById('wordCloudCanvas'), {
            list: wordList.data,
            gridSize: 24,
            weightFactor: 3,
            fontFamily: 'Arial',
            color: 'random-dark',
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error:', errorThrown);
    });
}

function getBullyStat() {
    $.getJSON(`${endpointRoot}/get_bully_stat_region_list`, function (response) {
        const $select = $('#regionSelect');

        var data = response.data;

        data.forEach(region => {
            const option = $('<option>', {
                value: region.code,
                text: region.name
            });
            $select.append(option);
        });

        // Important: refresh the Bootstrap Select UI
        $select.selectpicker('refresh');
    });

    $.getJSON(`${endpointRoot}/get_bully_stat`, function (response) {
        bullyStat = response.data;

        const allRegions = ['Indonesia', 'Malaysia', 'Singapore'];
        //const allRegions = [...new Set(bullyStat.map(d => d.country))];
        console.log(allRegions);
        $('#regionSelect').selectpicker('val', allRegions); // preselect
        updateBarChart(allRegions);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error:', errorThrown);
    });
}

function getSocmedUsage() {
    $.getJSON(`${endpointRoot}/get_socmed_usage`, function (response) {
        socmedUsage = response.data;

        drawScatterPlot();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error:', errorThrown);
    });
}

function updateBarChart(selectedRegions) {
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
                            text: '%'
                        }
                    }
                }
            }
        });
    }
}

function drawScatterPlot() {
    const xValues = socmedUsage.map(d => d.x);
    const yValues = socmedUsage.map(d => d.y);
    const cValues = socmedUsage.map(d => d.c);

    const xMin = Math.ceil(Math.min(...xValues) - 1);
    const xMax = Math.floor(Math.max(...xValues) + 1);
    const yMin = Math.ceil(Math.min(...yValues) - 1);
    const yMax = Math.floor(Math.max(...yValues) + 1);
    const cMin = Math.min(...cValues);
    const cMax = Math.max(...cValues);

    const points = socmedUsage.map(item => ({
        x: item.x,
        y: item.y,
        backgroundColor: getColorFromValue(item.c, cMin, cMax),
        radius: 6
    }));

    const ctx = document.getElementById('scatterChart').getContext('2d');

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatterplot with color dimension',
                data: points,
                parsing: false, // disables automatic parsing of x/y
                showLine: false,
                pointBackgroundColor: points.map(p => p.backgroundColor), // assign individual colors
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
                        text: 'Average Daily Social Media Usage (Hours)'
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Sleep Hours per Night'
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: false
                }
            }
        }
    });
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

function switchBox() {
    const box1 = document.getElementById('box1');
    const box2 = document.getElementById('box2');

    // Copy height from box1 to box2
    box2.style.minHeight = box1.offsetHeight + 'px';

    box1.classList.add('d-none');
    box2.classList.remove('d-none');
}

$('#regionSelect').on('changed.bs.select', function () {
    const selectedRegions = $(this).val(); // Array of selected values
    updateBarChart(selectedRegions);
});