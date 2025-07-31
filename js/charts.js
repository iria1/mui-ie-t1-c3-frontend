let bullyStat = [];
let chartInstance = null;

$(document).ready(function () {
    getBullyStatRegionList();
});

//////////////
// API call //
//////////////

function getBullyStatRegionList() {
    // get list of countries for combo box
    $.ajax({
        url: `${endpointRoot}/v2/charts/get_bully_stat_region_list`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (response) {
            const data = response.data;
            const select = $('#regionSelect');

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

            getBullyStat();
        },
        fail: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

function getBullyStat() {
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

///////////////////
// Event handler //
///////////////////

// update bar chart when combo box values change
$('#regionSelect').on('changed.bs.select', function () {
    const selectedRegions = $(this).val(); // Array of selected values
    updateBarChart(selectedRegions);
});

/////////////////////
// Helper function //
/////////////////////

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

function checkCheckboxStatus() {
    if ($('#resp1').prop('checked') && $('#resp2').prop('checked') && $('#resp3').prop('checked')) {
        $('#btnResp').prop("disabled", false);
    } else {
        $('#btnResp').prop("disabled", true);
    }
}