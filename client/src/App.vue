<template>
  <div id="app" class="container-fluid d-flex flex-column justify-content-center align-items-center mt-5">
    <button @click="subscribe()">Subscribe</button> <br />
    <h5>Willkommen bei der Service Worker Untersuchung!!</h5>
    <img
      src="../public/images/employees.jpg"
      height="300px"
      class="mx-auto d-block mt-5"
      alt="picture of employee"
    />
    <h5 class="mb-5 mt-5">Hier könnte Ihre Werbung stehen!</h5>

    <div class="alert alert-danger text-center" v-if="this.offline == true" style="width: 100%" role="alert">
      You are offline...
    </div>
    <ButtonGet @get="fetchData"></ButtonGet>
    <CardView :employees="employees" @del="delEmployee"></CardView>
  </div>
</template>

<script>
import { openDB } from 'idb';

import ButtonGet from '@/components/ButtonGet.vue';
import CardView from '@/components/CardView.vue';
import axios from 'axios';

export default {
  name: 'app',
  components: {
    ButtonGet,
    CardView,
  },
  data() {
    return {
      employees: [],
      serverAddress: process.env.VUE_APP_SERVER,
      once: false,
      offline: false,
      publicVapidKey:
        'BI3xP181nkMMKLD9QKAftKgDmb_o5nm5NZT1YUJLOwhOVUNU10KpAmPbfJu_bvwaXBsvS1JjrD7mzKtLDpvVoJI',
      db: null,
    };
  },
  created() {
    document.addEventListener('swUpdated', this.updateAvailable, { once: true });
    window.addEventListener('online', () => (this.offline = false));
    window.addEventListener('offline', () => (this.offline = true));
  },
  methods: {
    async openDB() {
      this.db = await openDB('employeesDB1', 1, {
        upgrade(db) {
          db.createObjectStore('employees', { keyPath: 'id' });
        },
      });
    },
    async getOnline() {
      try {
        let { data } = await axios.get(`${this.serverAddress}/employees`);
        this.employees = data.map((el) => ({ ...el, isDeleted: false }));

        await this.employees.forEach((element) => {
          this.db.put('employees', element);
        });
      } catch (error) {
        console.error(error);
      }
    },
    async getOffline() {
      const employees = await this.db.getAll('employees');
      this.employees = employees.filter((el) => el.isDeleted == false);
    },
    // async getEmployees() {
    //   try {
    //     const { data } = await axios({
    //       url: this.serverAddress + '/employees',
    //       method: 'GET',
    //     });
    //     this.employees = data;
    //   } catch (error) {
    //     console.error(error);
    //   }
    // },
    async delEmployee(e) {
      console.log(`${this.serverAddress}/employee/${e.id}`);
      await axios({
        url: `${this.serverAddress}/employee/${e.id}`,
        method: 'DELETE',
      });
      this.getEmployees();
    },
    fetchData() {
      console.log('fetchData called');
      // this.getEmployees();
      if (this.offline) this.getOffline();
      else this.getOnline();
    },
    updateAvailable() {
      alert('Update vorhanden, bitte App neu starten!');
    },
    async subscribe() {
      if (!('serviceWorker' in navigator)) {
        console.log('no service worker!');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey),
      });
      await axios.post('/subscribe', subscription);
    },
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  },
};
</script>

<style></style>
