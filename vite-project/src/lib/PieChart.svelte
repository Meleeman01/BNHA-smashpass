<script>
  export let smashData;
  export let passData;

  import { Pie } from 'svelte-chartjs';
  console.log(smashData,passData, typeof smashData);
let data = {
  labels: ['Smash', 'Pass'],
  datasets: [
    {
      data: [smashData,passData],
      backgroundColor: [
        '#46BFBD',
        '#FF5A5E',
        '#FDB45C',
        '#949FB1',
        '#4D5360',
        '#AC64AD',
      ],
      hoverBackgroundColor: [
        '#F7464A',
        '#5AD3D1',
        '#FFC870',
        '#A8B3C5',
        '#616774',
        '#DA92DB',
      ],
    },
  ],
};
  

  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
  } from 'chart.js';

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
</script>

<Pie style=" z-index:-1;" {data} options={{ responsive: true }} />