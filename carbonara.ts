const constants = {
    "kwh-per-byte-datacenter": 0.000000000072,
    "kwh-per-byte-network": 0.000000000152,
    "kwh-per-minute-mobile": 0.00011,
    "kwh-per-minute-desktop": 0.00032,
    "co2-per-kwh": {
        "france": 34.8,
        "europe": 276,
        "china": 681,
        "us": 493,
        "world": 519
    }
}

const i18n = {
    en: {
        device: "Device:",
        zone: "Zone:",
        transfer: "Transfer:",
        duration: "Duration:",
        reinsurance: "Information calculated on the client only.\nIt is not transferred."
    },
    fr: {
        device: "Device :",
        zone: "Zone :",
        transfer: "Transfert :",
        duration: "Durée :",
        reinsurance: "Informations calculées sur le client uniquement.\nElles ne sont pas transférées."
    }
}

const zones: {name: keyof typeof constants["co2-per-kwh"], test: RegExp}[] = [
    { name: "france", test: /Europe\/Paris/i },
    { name: "europe", test: /Europe/i },
    { name: "china", test: /Asia\/(Chongqing|Harbin|Kashgar|Shanghai|Urumqi)/i },
    { name: "us", test: /America\/(Adak|Anchorage|Boise|Chicago|Denver|Detroit|Indiana|Juneau|Kentucky|Los_Angeles|Menominee|Metlakatla|New_York|Nome|Phoenix|Sitka|Yakutat)/i }
];

const template = document.createElement('template');
template.innerHTML = `
<style>
    #carbonara { display: inline-block; position: relative; font-family: Verdana, sans-serif; font-size: 12px; }
    #carbonara:hover #tooltip { opacity: 1; transform: translateX(-50%) translateY(0)} 
    #tooltip { pointer-events: none; font-weight: normal; transition: all 0.2s ease-in 0.3s; opacity: 0; padding: 10px; color: white; background: rgba(0,0,0,0.75); border-radius: 4px; position: absolute; transform: translateX(-50%) translateY(-5%); bottom: 24px; left: 25%; }
    #tooltip:after { content: ''; width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-top: 7px solid rgba(0,0,0,0.75); position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); }
    #tooltip.bottom {top: 24px; bottom: auto; transform: translateX(-50%) translateY(5%); }
    #tooltip.bottom:after {top:-7px; bottom: auto; border-top: none; border-bottom: 7px solid rgba(0,0,0,0.75);}
    #info { margin: 0; padding: 0; list-style: none; }
    #reinsurance { margin: 8px 0 0; white-space: pre; }
</style>
<div id="carbonara">
    <div id="tooltip">
        <ul id="info">
            <li id="device" />
            <li id="zone" />
            <li id="transfer" />
            <li id="duration" />
        </ul>
        <p id="reinsurance" />
    </div>
    <span id="carbon"></span>
</div>`;

class Carbonara extends HTMLElement {
    private readonly mobile: boolean;
    private readonly zone: keyof typeof constants["co2-per-kwh"];
    private readonly language: "en" | "fr";

    private duration = 0;
    private frequency = 200;
    private timer: number;
    private persistance: string = "none";

    constructor() {
        super();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
        this.zone = zones.find(zone => zone.test.test(timeZone))?.name || "world";
        this.language = /^fr\b/.test(navigator.language) ? "fr" : "en";
        this.mobile = /Mobi|Android/i.test(navigator.userAgent);
        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
        return ["position"];
    }

    connectedCallback() {
        this.timer = setInterval(() => this.update(), this.frequency);
        this.update();
    }

    disconnectedCallback() {
        clearInterval(this.timer);
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "position") {
            this.shadowRoot.getElementById("tooltip").className = newValue;
        }
        if (name === "persistance") {
            this.persistance = newValue;
        }
    }

    update() {
        if (document.visibilityState !== "hidden") {
            this.duration += this.frequency / 60 / 1000;
        }
        const transferSize = performance ? performance.getEntries().reduce((acc, cur) => acc + ((cur as any).transferSize || 0), 0) : 0;
        const kWhDataCenter = transferSize * constants["kwh-per-byte-datacenter"] * constants["co2-per-kwh"][this.zone];
        const kWhNetwork = transferSize * constants["kwh-per-byte-network"] * constants["co2-per-kwh"][this.zone];
        const kWhDevice = this.duration * (this.mobile ? constants["kwh-per-minute-mobile"] : constants["kwh-per-minute-desktop"]) * constants["co2-per-kwh"][this.zone];
        const carbon = kWhDataCenter + kWhNetwork + kWhDevice;
        this.shadowRoot.getElementById("device").textContent = `${i18n[this.language].device} ${this.mobile ? "mobile" : "desktop"}`;
        this.shadowRoot.getElementById("zone").textContent = `${i18n[this.language].zone} ${this.zone}`;
        this.shadowRoot.getElementById("transfer").textContent = `${i18n[this.language].transfer} ${Math.round(transferSize / 1024)} ko`;
        this.shadowRoot.getElementById("duration").textContent = `${i18n[this.language].duration} ${Math.round(this.duration * 60)} s`;
        this.shadowRoot.getElementById("reinsurance").textContent = `${i18n[this.language].reinsurance}`;
        this.shadowRoot.getElementById("carbon").textContent = `${carbon.toFixed(3)} gCO2e`;
    }
}
customElements.define('carbon-ara', Carbonara);

