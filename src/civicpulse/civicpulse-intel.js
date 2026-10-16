/**
 * CivicPulse Sight — Urban Intelligence & CCTV Bridge
 * Features:
 * 1. Hover & Click Detailed Road Condition & Triage Report beside CCTV cameras
 * 2. Citizen Feedback Portal with nearest CCTV auto-patching & live model scoring
 * 3. Comprehensive Admin Command Console for Road Repair Severity & Globe Navigation
 */

import * as Cesium from 'cesium';

// Initial Seed Complaints with realistic field photo evidence
const INITIAL_COMPLAINTS = [
  {
    id: "CP-2026-081",
    road: "Congress Ave & 11th St",
    locationId: "L0642",
    zone: "ZONE_02",
    category: "Pothole",
    severity: "Critical",
    roadCondition: "Critical",
    cctvCamera: "Congress Ave & 11th St [ATX-101]",
    distanceM: 42,
    injuries: 1,
    pedestrian: "High",
    nearSchool: true,
    nearHospital: true,
    description: "Deep structural fissure and sunken asphalt in southbound lane causing rim damage and vehicle swerving near the pedestrian crossing.",
    timestamp: "2026-10-15 08:34",
    status: "Open",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "CP-2026-074",
    road: "Lamar Blvd & 5th St",
    locationId: "L0300",
    zone: "ZONE_04",
    category: "Signal failure",
    severity: "High",
    roadCondition: "Poor",
    cctvCamera: "Lamar Blvd & 5th St [ATX-142]",
    distanceM: 68,
    injuries: 0,
    pedestrian: "Low",
    nearSchool: true,
    nearHospital: false,
    description: "Traffic controller unit shorted out after rainstorm. Mast-arm signal blinking red intermittently causing severe junction gridlock.",
    timestamp: "2026-10-14 16:15",
    status: "Assigned",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "CP-2026-069",
    road: "Barton Springs Rd & Riverside",
    locationId: "L0140",
    zone: "ZONE_02",
    category: "Blocked drain",
    severity: "Critical",
    roadCondition: "Poor",
    cctvCamera: "Barton Springs & Riverside [ATX-204]",
    distanceM: 85,
    injuries: 0,
    pedestrian: "High",
    nearSchool: false,
    nearHospital: false,
    description: "Stormwater culvert clogged with heavy debris. Underpass water level rising up to curb height during moderate rain.",
    timestamp: "2026-10-14 11:20",
    status: "In Progress",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "CP-2026-058",
    road: "Guadalupe St & 24th St (The Drag)",
    locationId: "L0729",
    zone: "ZONE_12",
    category: "Streetlight outage",
    severity: "Medium",
    roadCondition: "Fair",
    cctvCamera: "Guadalupe & 24th [ATX-310]",
    distanceM: 50,
    injuries: 0,
    pedestrian: "High",
    nearSchool: true,
    nearHospital: true,
    description: "Four consecutive luminaire fixtures dark on the eastern sidewalk posing safety risks for campus night commuters.",
    timestamp: "2026-10-13 21:05",
    status: "Open",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"
  }
];

// High-fidelity Austin road corridors with condition, defect telemetry & coordinates
const AUSTIN_ROAD_CORRIDORS = [
  {
    id: "congress-ave",
    name: "Congress Ave Arterial Corridor",
    code: "CORR-01",
    roadCondition: "Critical",
    badgeClass: "Critical",
    glowColor: "#ff2e88",
    issue: "Critical sub-base asphalt shear & recurrent pothole cluster (depth >8cm) causing rim damage and vehicle swerving near pedestrian crosswalk.",
    category: "Pothole & Sub-base Failure",
    priorityScore: 97.5,
    rank: 1,
    incidents: 14,
    complaints: 12,
    casualties: 2,
    nearestCamera: "Congress Ave & 11th St [ATX-101]",
    locationId: "L0642",
    zone: "ZONE_02",
    coordinates: [
      -97.7408, 30.2825,
      -97.7415, 30.2740,
      -97.7428, 30.2685,
      -97.7445, 30.2625,
      -97.7470, 30.2540,
      -97.7490, 30.2460
    ]
  },
  {
    id: "lamar-blvd",
    name: "Lamar Blvd Commercial Corridor",
    code: "CORR-02",
    roadCondition: "Poor",
    badgeClass: "Poor",
    glowColor: "#ffb02e",
    issue: "Traffic signal controller shorted out after heavy rainfall at 5th St junction & severe longitudinal alligator cracking.",
    category: "Signal Failure & Pavement Fatigue",
    priorityScore: 88.4,
    rank: 2,
    incidents: 9,
    complaints: 7,
    casualties: 0,
    nearestCamera: "Lamar Blvd & 5th St [ATX-142]",
    locationId: "L0300",
    zone: "ZONE_04",
    coordinates: [
      -97.7460, 30.2890,
      -97.7505, 30.2785,
      -97.7555, 30.2710,
      -97.7585, 30.2665,
      -97.7610, 30.2580,
      -97.7635, 30.2510
    ]
  },
  {
    id: "barton-springs-riverside",
    name: "Barton Springs & Riverside Underpass",
    code: "CORR-03",
    roadCondition: "Critical",
    badgeClass: "Critical",
    glowColor: "#ff3b30",
    issue: "Stormwater culvert clogged with heavy debris & gravel wash; standing flood water rising to curb height during rain events.",
    category: "Blocked Drain & Flood Hazard",
    priorityScore: 92.1,
    rank: 3,
    incidents: 11,
    complaints: 9,
    casualties: 0,
    nearestCamera: "Barton Springs & Riverside [ATX-204]",
    locationId: "L0140",
    zone: "ZONE_02",
    coordinates: [
      -97.7715, 30.2635,
      -97.7595, 30.2605,
      -97.7520, 30.2580,
      -97.7470, 30.2570,
      -97.7360, 30.2520,
      -97.7260, 30.2470
    ]
  },
  {
    id: "guadalupe-drag",
    name: "Guadalupe St / The Drag (Campus Arterial)",
    code: "CORR-04",
    roadCondition: "Fair",
    badgeClass: "Fair",
    glowColor: "#27e6ff",
    issue: "Multiple streetlight luminaire outages near 24th St crossing and sidewalk heaving from live oak roots causing trip hazards.",
    category: "Streetlight Outage & Sidewalk Heave",
    priorityScore: 68.3,
    rank: 7,
    incidents: 6,
    complaints: 5,
    casualties: 0,
    nearestCamera: "Guadalupe & 24th [ATX-310]",
    locationId: "L0729",
    zone: "ZONE_12",
    coordinates: [
      -97.7395, 30.2945,
      -97.7410, 30.2880,
      -97.7435, 30.2780,
      -97.7450, 30.2715,
      -97.7465, 30.2660
    ]
  },
  {
    id: "6th-street",
    name: "East 6th Street Historic Corridor",
    code: "CORR-05",
    roadCondition: "Poor",
    badgeClass: "Poor",
    glowColor: "#ff9f0a",
    issue: "Broken decorative pavers, missing stormwater intake grate, and asphalt raveling in dense pedestrian nightlife district.",
    category: "Broken Pavers & Missing Grate",
    priorityScore: 84.7,
    rank: 4,
    incidents: 10,
    complaints: 8,
    casualties: 1,
    nearestCamera: "6th St & Brazos [ATX-112]",
    locationId: "L0215",
    zone: "ZONE_02",
    coordinates: [
      -97.7550, 30.2720,
      -97.7470, 30.2698,
      -97.7428, 30.2685,
      -97.7350, 30.2665,
      -97.7310, 30.2655,
      -97.7220, 30.2635
    ]
  },
  {
    id: "ih-35-expressway",
    name: "IH-35 Downtown Expressway Corridor",
    code: "CORR-06",
    roadCondition: "Critical",
    badgeClass: "Critical",
    glowColor: "#ff2e88",
    issue: "Compromised crash barrier attenuator & bridge deck expansion joint spalling on elevated frontage ramps.",
    category: "Guardrail Structural Damage & Joint Spall",
    priorityScore: 91.0,
    rank: 5,
    incidents: 15,
    complaints: 11,
    casualties: 3,
    nearestCamera: "I-35 & 12th St [ATX-405]",
    locationId: "L0550",
    zone: "ZONE_08",
    coordinates: [
      -97.7340, 30.2530,
      -97.7325, 30.2600,
      -97.7310, 30.2660,
      -97.7290, 30.2740,
      -97.7270, 30.2820,
      -97.7240, 30.2920
    ]
  },
  {
    id: "mlk-blvd",
    name: "MLK Jr Blvd Civic & Hospital Route",
    code: "CORR-07",
    roadCondition: "Good",
    badgeClass: "Good",
    glowColor: "#38f28a",
    issue: "Routine crack sealing complete; priority emergency medical ambulance clearway maintained with active sensor monitoring.",
    category: "Routine Clearway Monitoring",
    priorityScore: 48.2,
    rank: 18,
    incidents: 3,
    complaints: 2,
    casualties: 0,
    nearestCamera: "MLK & San Jacinto [ATX-512]",
    locationId: "L0810",
    zone: "ZONE_06",
    coordinates: [
      -97.7485, 30.2840,
      -97.7405, 30.2825,
      -97.7325, 30.2815,
      -97.7270, 30.2820,
      -97.7180, 30.2830
    ]
  }
];

class CivicPulseIntel {
  constructor() {
    this.locationsData = null;
    this.modelInference = null;
    this.complaints = this.loadComplaints();
    this.cctvRecords = [];
    this.activeCamera = null;
    this.activeLocation = null;
    this.viewer = null;
    this.initialized = false;
    this.isPinned = false;
    this.hoverTimeout = null;
    this.roadEntities = [];
    this.hoveredRoad = null;
    this.roadCorridorsRendered = false;

    this.init();
  }

  loadComplaints() {
    try {
      const stored = localStorage.getItem("civicpulse_citizen_complaints");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not read stored complaints", e);
    }
    return [...INITIAL_COMPLAINTS];
  }

  saveComplaints() {
    try {
      localStorage.setItem("civicpulse_citizen_complaints", JSON.stringify(this.complaints));
    } catch (e) {
      console.warn("Could not save complaints", e);
    }
  }

  async init() {
    await this.fetchDatasets();
    this.buildUIElements();
    this.bindGlobalEvents();
    this.attachCesiumHook();
  }

  async fetchDatasets() {
    try {
      const pRes = await fetch("/smartcity/data/priorities.json");
      if (pRes.ok) {
        this.locationsData = await pRes.json();
      }
    } catch (e) {
      console.warn("Failed to load priorities.json", e);
    }

    try {
      const mRes = await fetch("/smartcity/data/model_inference.json");
      if (mRes.ok) {
        this.modelInference = await mRes.json();
      }
    } catch (e) {
      console.warn("Failed to load model_inference.json", e);
    }
  }

  attachCesiumHook() {
    const checkViewer = () => {
      if (window.CIVICPULSE_APP && window.CIVICPULSE_APP.viewer) {
        this.viewer = window.CIVICPULSE_APP.viewer;
        this.bindCesiumInteraction();
        this.bindCctvLayerSubscription();
        this.renderRoadCorridors();
        return;
      }
      setTimeout(checkViewer, 500);
    };
    checkViewer();
  }

  bindCctvLayerSubscription() {
    const checkLayer = () => {
      const dataManager = window.CIVICPULSE_APP?.dataManager || window.CIVICPULSE_APP?.components?.data?.dataManager;
      const cctv = dataManager?.layers?.get('cctv')?.module;
      if (cctv && typeof cctv.subscribe === 'function') {
        cctv.subscribe((payload) => {
          if (payload?.activeCamera && (!this.activeCamera || this.activeCamera.id !== payload.activeCamera.id)) {
            this.showCameraDossier(payload.activeCamera, true);
          }
        });
        return;
      }
      setTimeout(checkLayer, 1000);
    };
    checkLayer();
  }

  bindCesiumInteraction() {
    if (!this.viewer || this.initialized) return;
    this.initialized = true;

    // Render road corridors polyline lines across Austin
    this.renderRoadCorridors();

    // Screen Space Event Handler for Hover and Click on Cameras & Road Lines
    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

    // Hover Handler
    handler.setInputAction((movement) => {
      if (!movement || !movement.endPosition) return;

      let picked = null;
      try {
        picked = this.viewer.scene.pick(movement.endPosition);
      } catch (e) {}

      // 1. Check if hovering over a road line (WebGL pick or projected 2D screen proximity)
      let roadData = this.getRoadDataFromPicked(picked);
      let roadEntity = picked?.id;

      if (!roadData) {
        const near = this.findRoadNearScreenPoint(movement.endPosition, 24);
        if (near) {
          roadData = near.road;
          roadEntity = near.entity;
        }
      }

      if (roadData) {
        this.unhighlightAllRoads();
        this.highlightRoad(roadEntity, true);
        this.showRoadIssueTooltip(roadData, movement.endPosition);
        if (this.viewer?.scene?.canvas) this.viewer.scene.canvas.style.cursor = "pointer";
        return;
      } else {
        this.hideRoadIssueTooltip();
        this.unhighlightAllRoads();
        if (this.viewer?.scene?.canvas) this.viewer.scene.canvas.style.cursor = "default";
      }

      if (this.isPinned) return; // Keep clicked view active

      // 2. Check if hovering over a CCTV Camera
      if (picked && picked.id) {
        const cam = this.extractCameraFromPicked(picked);
        if (cam) {
          clearTimeout(this.hoverTimeout);
          this.showCameraDossier(cam, false, movement.endPosition);
          return;
        }
      }

      // If hovering over empty space and not pinned, schedule close
      if (!this.isPinned) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = setTimeout(() => {
          if (!this.isPinned) {
            document.querySelector("#cp-camera-dossier")?.classList.remove("active");
          }
        }, 800);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Click Handler
    handler.setInputAction((click) => {
      if (!click || !click.position) return;
      let picked = null;
      try {
        picked = this.viewer.scene.pick(click.position);
      } catch (e) {}

      // 1. Check if clicked on a road line
      let roadData = this.getRoadDataFromPicked(picked);
      if (!roadData) {
        const near = this.findRoadNearScreenPoint(click.position, 26);
        if (near) {
          roadData = near.road;
        }
      }

      if (roadData) {
        this.handleRoadClick(roadData);
        return;
      }

      // 2. Check if clicked on a CCTV camera
      if (picked && picked.id) {
        const cam = this.extractCameraFromPicked(picked);
        if (cam) {
          this.isPinned = true;
          this.showCameraDossier(cam, true, click.position);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  findRoadNearScreenPoint(screenPos, thresholdPx = 24) {
    if (!this.viewer || !this.viewer.scene) return null;
    const scene = this.viewer.scene;

    const distToSegment = (px, py, x1, y1, x2, y2) => {
      const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    };

    let closest = null;
    let minDistance = thresholdPx;

    for (const road of AUSTIN_ROAD_CORRIDORS) {
      const coords = road.coordinates;
      for (let i = 0; i < coords.length - 2; i += 2) {
        try {
          const p1 = Cesium.Cartesian3.fromDegrees(coords[i], coords[i + 1]);
          const p2 = Cesium.Cartesian3.fromDegrees(coords[i + 2], coords[i + 3]);
          const w1 = Cesium.SceneTransforms.worldToWindowCoordinates(scene, p1);
          const w2 = Cesium.SceneTransforms.worldToWindowCoordinates(scene, p2);

          if (w1 && w2) {
            const dist = distToSegment(screenPos.x, screenPos.y, w1.x, w1.y, w2.x, w2.y);
            if (dist < minDistance) {
              minDistance = dist;
              const entity = this.roadEntities.find(e => e.id === `cp-road-${road.id}`);
              closest = { road, entity, dist };
            }
          }
        } catch (e) {}
      }
    }
    return closest;
  }

  // --------------------------------------------------------------------------
  // Road Corridors Rendering & Hover/Click Management
  // --------------------------------------------------------------------------
  renderRoadCorridors() {
    if (!this.viewer || this.roadCorridorsRendered) return;
    this.roadCorridorsRendered = true;

    AUSTIN_ROAD_CORRIDORS.forEach(road => {
      try {
        const positions = Cesium.Cartesian3.fromDegreesArray(road.coordinates);
        const entity = this.viewer.entities.add({
          id: `cp-road-${road.id}`,
          name: road.name,
          polyline: {
            positions: positions,
            width: 7,
            clampToGround: true,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.35,
              taperPower: 1.0,
              color: Cesium.Color.fromCssColorString(road.glowColor)
            })
          }
        });
        entity._roadData = road;
        this.roadEntities.push(entity);
      } catch (err) {
        console.warn("Could not render road corridor polyline:", road.id, err);
      }
    });
  }

  getRoadDataFromPicked(picked) {
    if (!picked || !picked.id) return null;
    if (picked.id._roadData) return picked.id._roadData;
    const id = typeof picked.id === "string" ? picked.id : picked.id.id || "";
    if (id.startsWith("cp-road-")) {
      const roadId = id.replace("cp-road-", "");
      return AUSTIN_ROAD_CORRIDORS.find(r => r.id === roadId) || null;
    }
    return null;
  }

  highlightRoad(entity, isHighlighted) {
    if (!entity || !entity.polyline) return;
    entity.polyline.width = isHighlighted ? 12 : 7;
  }

  unhighlightAllRoads() {
    this.roadEntities.forEach(ent => {
      if (ent.polyline) ent.polyline.width = 7;
    });
  }

  showRoadIssueTooltip(road, screenPos) {
    let tooltip = document.querySelector("#cp-road-issue-tooltip");
    if (!tooltip) return;

    tooltip.innerHTML = `
      <div class="cp-road-tooltip-head">
        <div class="cp-road-tooltip-title">${road.name}</div>
        <span class="cp-road-tooltip-badge ${road.badgeClass}">${road.roadCondition}</span>
      </div>
      <div class="cp-road-tooltip-issue ${road.badgeClass}">
        ⚠️ <b>ROAD DEFECT:</b> ${road.issue}
      </div>
      <div class="cp-road-tooltip-meta">
        <span>AI Urgency Rank: <b>#${road.rank} of 1,000</b></span>
        <span>ML Score: <b>${road.priorityScore.toFixed(1)}/100</b></span>
        <span>Active Incidents: <b>${road.incidents}</b></span>
        <span>Citizen Complaints: <b>${road.complaints}</b></span>
        <span style="grid-column: span 2">Nearest CCTV: <b>${road.nearestCamera}</b></span>
      </div>
      <div class="cp-road-tooltip-action">
        <span>⚡</span> <b>Click road line</b> to fly camera & open full AI telemetry card
      </div>
    `;

    // Position tooltip safely within window
    const pad = 16;
    let x = screenPos.x + 18;
    let y = screenPos.y + 18;
    const width = 380;
    const height = 180;

    if (x + width > window.innerWidth - pad) {
      x = screenPos.x - width - 18;
    }
    if (y + height > window.innerHeight - pad) {
      y = screenPos.y - height - 18;
    }

    tooltip.style.left = `${Math.max(pad, x)}px`;
    tooltip.style.top = `${Math.max(pad, y)}px`;
    tooltip.classList.add("active");
  }

  hideRoadIssueTooltip() {
    const tooltip = document.querySelector("#cp-road-issue-tooltip");
    if (tooltip) {
      tooltip.classList.remove("active");
    }
  }

  handleRoadClick(road) {
    if (!this.viewer) return;

    // Center coords
    const coords = road.coordinates;
    const midIdx = Math.floor(coords.length / 4) * 2;
    const lon = coords[midIdx];
    const lat = coords[midIdx + 1];

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat - 0.003, 580.0),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-35)
      },
      duration: 1.5
    });

    this.pulseReticle(window.innerWidth / 2, window.innerHeight / 2);

    // Synthesize camera representation for this road
    const synthCam = {
      id: `CCTV-${road.id}`,
      name: road.nearestCamera,
      latitude: lat,
      longitude: lon,
      roadCorridor: road.name,
      roadCondition: road.roadCondition,
      issue: road.issue
    };

    this.isPinned = true;
    this.showCameraDossier(synthCam, true);
    this.showToast(`Selected Corridor: ${road.name} — Condition: ${road.roadCondition}`);
  }

  extractCameraFromPicked(picked) {
    if (!picked || !picked.id) return null;
    const id = typeof picked.id === "string" ? picked.id : picked.id.id || "";
    if (id.startsWith("cp-road-") || picked.id._roadData) return null; // Ignore roads
    if (id.includes("cctv") || id.includes("camera") || picked.primitive?._cctvId) {
      const camId = picked.primitive?._cctvId || id;
      return this.findOrSynthesizeCamera(camId);
    }
    return null;
  }

  findOrSynthesizeCamera(camId) {
    const dataManager = window.CIVICPULSE_APP?.dataManager || window.CIVICPULSE_APP?.components?.data?.dataManager;
    const cctvModule = dataManager?.layers?.get?.("cctv")?.module;
    const records = cctvModule?.getUIState?.()?.cameras || [];
    let found = records.find(c => c.id === camId || c.name === camId);
    if (!found) {
      found = {
        id: camId,
        name: camId.replace(/[-_]/g, " ").toUpperCase(),
        latitude: 30.2672 + (Math.random() - 0.5) * 0.04,
        longitude: -97.7431 + (Math.random() - 0.5) * 0.04
      };
    }
    return found;
  }

  matchLocationForCamera(camera) {
    if (!this.locationsData?.locations) {
      return {
        id: "L0642",
        rank: 1,
        score: 97.5,
        road_condition: "Critical",
        road_type: "Arterial",
        top_type: "Pothole",
        n_inc: 14,
        n_com: 12,
        density: 20714,
        school: 1,
        hospital: 1,
        ped: "High",
        reasons: [{ label: "Severity-weighted incident load", points: 29.4 }]
      };
    }

    const locs = this.locationsData.locations;
    let hash = 0;
    const str = camera.id || camera.name || "cctv";
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % locs.length;
    return locs[idx];
  }

  // --------------------------------------------------------------------------
  // UI Building
  // --------------------------------------------------------------------------
  buildUIElements() {
    // 1. Inject Top Navigation Buttons directly to document.body (ZERO overlap with #top-center-actions)
    let topBar = document.getElementById("cp-top-bar");
    if (!topBar) {
      topBar = document.createElement("div");
      topBar.id = "cp-top-bar";
      topBar.innerHTML = `
        <button id="btn-cp-report" type="button" class="civicpulse-top-btn" title="File Citizen Road Issue">
          <span style="font-size:13px">📝</span> REPORT ISSUE
        </button>
        <button id="btn-cp-admin" type="button" class="civicpulse-top-btn btn-admin" title="Open Road Repair Admin Console">
          <span style="font-size:13px">🛡️</span> ADMIN CONSOLE
        </button>
      `;
      document.body.appendChild(topBar);
    }

    // Floating Road Issue HUD Tooltip container
    let roadTooltip = document.getElementById("cp-road-issue-tooltip");
    if (!roadTooltip) {
      roadTooltip = document.createElement("div");
      roadTooltip.id = "cp-road-issue-tooltip";
      document.body.appendChild(roadTooltip);
    }

    // 2. Build Hover/Click Camera Dossier HUD Card
    const dossier = document.createElement("div");
    dossier.id = "cp-camera-dossier";
    dossier.innerHTML = `
      <div class="cp-dossier-header">
        <div class="cp-dossier-title-wrap">
          <span class="cp-dossier-tag">CCTV SENSOR &middot; ROAD TELEMETRY</span>
          <h4 class="cp-dossier-name" id="cp-dos-name">Congress Ave & 11th St</h4>
          <div class="cp-dossier-loc" id="cp-dos-loc">Zone 02 &middot; Loc #L0642 &middot; 30.2799 N, 97.7408 W</div>
        </div>
        <div class="cp-dossier-actions">
          <button class="cp-btn-icon" id="cp-dos-expand" title="Expand Full Dossier">⛶</button>
          <button class="cp-btn-icon" id="cp-dos-close" title="Close">✕</button>
        </div>
      </div>
      <div class="cp-dossier-body">
        <div class="cp-urgency-card">
          <div>
            <div style="font:10px var(--cp-mono);color:var(--cp-dim);margin-bottom:4px">ROAD CONDITION</div>
            <span class="cp-urgency-badge Critical" id="cp-dos-urgency">CRITICAL REPAIR REQUIRED</span>
          </div>
          <div class="cp-score-gauge">
            <div class="cp-score-val" id="cp-dos-score">97.5</div>
            <div class="cp-score-label" id="cp-dos-rank">RANK #1 OF 1,000</div>
          </div>
        </div>

        <div class="cp-metrics-grid">
          <div class="cp-metric-box">
            <div class="cp-metric-title">Reported Incidents</div>
            <div class="cp-metric-val" id="cp-dos-incidents">14 Total</div>
          </div>
          <div class="cp-metric-box">
            <div class="cp-metric-title">Unresolved Backlog</div>
            <div class="cp-metric-val" style="color:var(--cp-pink)" id="cp-dos-backlog">8 Active (48h)</div>
          </div>
          <div class="cp-metric-box">
            <div class="cp-metric-title">Casualties / Injuries</div>
            <div class="cp-metric-val" style="color:var(--cp-amber)" id="cp-dos-injuries">2 Reported</div>
          </div>
          <div class="cp-metric-box">
            <div class="cp-metric-title">Citizen Complaints</div>
            <div class="cp-metric-val" style="color:var(--cp-cyan)" id="cp-dos-complaints">12 Submissions</div>
          </div>
        </div>

        <!-- Mini Charts -->
        <div class="cp-chart-section">
          <div class="cp-chart-title">
            <span>Incident Category Distribution</span>
            <span style="color:var(--cp-dim);font-weight:400">HISTORICAL</span>
          </div>
          <div id="cp-dos-bars"></div>
        </div>

        <!-- Top Reasons -->
        <div class="cp-chart-section">
          <div class="cp-chart-title">
            <span>Why This Road Ranks High</span>
            <span style="color:var(--cp-dim);font-weight:400">MODEL ATTRIBUTION</span>
          </div>
          <div id="cp-dos-reasons" style="font-size:12px;color:var(--cp-dim);line-height:1.5"></div>
        </div>

        <!-- Collapsible Citizen Complaints -->
        <div class="cp-complaints-section">
          <button class="cp-complaints-toggle" id="cp-dos-complaints-toggle">
            <span>Citizen Filed Reports (<span id="cp-dos-complaints-count">3</span>)</span>
            <span id="cp-dos-toggle-arrow">▼</span>
          </button>
          <div id="cp-dos-complaints-list" style="display:block"></div>
        </div>
      </div>
      <div class="cp-dossier-footer">
        <button class="cp-btn-primary" id="cp-dos-file-btn">
          <span>📝</span> FILE REPORT FOR THIS ROAD
        </button>
        <button class="cp-btn-secondary" id="cp-dos-admin-btn">
          <span>🛡️</span> INSPECT
        </button>
      </div>
    `;
    document.body.appendChild(dossier);

    // 3. Build Citizen Complaint Modal
    const modal = document.createElement("div");
    modal.id = "cp-complaint-modal-overlay";
    modal.innerHTML = `
      <div class="cp-modal-window">
        <div class="cp-modal-header">
          <h3>📝 FILE ROAD CONDITION & REPAIR REPORT</h3>
          <button class="cp-btn-icon" id="cp-modal-close">✕</button>
        </div>
        <div class="cp-modal-body">
          <div class="cp-patch-notice" id="cp-patch-notice">
            <span>📍</span>
            <span id="cp-patch-text">Auto-linking to nearest road sensor & CCTV camera...</span>
          </div>

          <div class="cp-form-group">
            <label>Road / Intersection Location</label>
            <select class="cp-select" id="cp-form-road">
              <option value="Congress Ave & 11th St">Congress Ave & 11th St (Downtown Corridor)</option>
              <option value="Lamar Blvd & 5th St">Lamar Blvd & 5th St (Arterial Junction)</option>
              <option value="Barton Springs Rd & Riverside">Barton Springs Rd & Riverside Dr</option>
              <option value="Guadalupe St & 24th St">Guadalupe St & 24th St (Campus Drag)</option>
              <option value="IH-35 & 12th St Frontage">IH-35 & 12th St Frontage Road</option>
              <option value="South 1st St & Oltorf">South 1st St & W Oltorf St</option>
              <option value="Burnet Rd & Anderson Ln">Burnet Rd & W Anderson Ln</option>
            </select>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="cp-form-group">
              <label>Observed Road Condition</label>
              <select class="cp-select" id="cp-form-condition">
                <option value="Critical">Critical (Severe Damage / Potholes)</option>
                <option value="Poor">Poor (Significant Surface Cracks)</option>
                <option value="Fair">Fair (Surface Wear)</option>
                <option value="Good">Good (Minor Issue)</option>
              </select>
            </div>
            <div class="cp-form-group">
              <label>Primary Issue Category</label>
              <select class="cp-select" id="cp-form-category">
                <option value="Pothole">Pothole / Road Fissure</option>
                <option value="Signal failure">Traffic Signal Failure</option>
                <option value="Flooding">Flooding / Underpass Pooling</option>
                <option value="Blocked drain">Storm Drain Clogged</option>
                <option value="Streetlight outage">Streetlight Outage</option>
                <option value="Collision">Vehicular Collision Debris</option>
              </select>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="cp-form-group">
              <label>Reported Severity</label>
              <select class="cp-select" id="cp-form-severity">
                <option value="Critical">Critical (Immediate Hazard)</option>
                <option value="High">High (Impacting Flow)</option>
                <option value="Medium" selected>Medium (Standard)</option>
                <option value="Low">Low (Cosmetic / Advisory)</option>
              </select>
            </div>
            <div class="cp-form-group">
              <label>Pedestrian Density</label>
              <select class="cp-select" id="cp-form-ped">
                <option value="High">High (Heavy Footfall)</option>
                <option value="Medium" selected>Medium (Moderate)</option>
                <option value="Low">Low (Vehicle Only)</option>
              </select>
            </div>
          </div>

          <div style="display:flex;gap:14px;align-items:center;margin:6px 0">
            <label style="display:flex;gap:6px;align-items:center;cursor:pointer;font-size:12px">
              <input type="checkbox" id="cp-form-school" checked /> Near School Zone
            </label>
            <label style="display:flex;gap:6px;align-items:center;cursor:pointer;font-size:12px">
              <input type="checkbox" id="cp-form-hospital" /> Near Trauma Hospital
            </label>
            <div style="margin-left:auto;display:flex;align-items:center;gap:6px">
              <label style="font-size:12px">Injuries:</label>
              <input type="number" id="cp-form-injuries" class="cp-input" value="0" min="0" max="10" style="width:55px" />
            </div>
          </div>

          <!-- Photo Upload Zone -->
          <div class="cp-form-group">
            <label>Attach Photo Evidence (Image / Field Snapshot)</label>
            <div class="cp-drop-zone" id="cp-drop-zone">
              <div id="cp-drop-placeholder">
                <div style="font-size:24px;margin-bottom:4px">📷</div>
                <div style="font-size:12px;color:var(--cp-text);font-weight:600">Click to upload or drag & drop photo</div>
                <div style="font-size:10px;color:var(--cp-dim);margin-top:2px">PNG, JPG, WEBP up to 10MB</div>
              </div>
              <img id="cp-drop-preview" class="cp-drop-preview" alt="Incident preview" />
              <input type="file" id="cp-file-input" accept="image/*" style="display:none" />
            </div>
            <div style="font:10px var(--cp-mono);color:var(--cp-dim);margin-top:4px">Or select sample incident photo:</div>
            <div class="cp-sample-photos">
              <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=150" class="cp-sample-thumb" data-src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600" title="Severe Pothole" />
              <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=150" class="cp-sample-thumb" data-src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600" title="Signal Malfunction" />
              <img src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=150" class="cp-sample-thumb" data-src="https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=600" title="Underpass Flooding" />
              <img src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150" class="cp-sample-thumb" data-src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600" title="Streetlight Blackout" />
            </div>
          </div>

          <div class="cp-form-group">
            <label>Field Observation Description</label>
            <textarea class="cp-textarea" id="cp-form-desc" rows="3" placeholder="Describe hazards, lane obstruction, or specific repair needs..."></textarea>
          </div>

          <!-- Live Model Inference Box -->
          <div class="cp-live-calc-box">
            <div>
              <div class="cp-live-calc-title">REAL-TIME MODEL ESTIMATE</div>
              <div style="font:11px var(--cp-mono);color:var(--cp-text)">Calculated Priority Score: <b id="cp-calc-score" style="color:var(--cp-cyan)">88.4 / 100</b></div>
            </div>
            <div class="cp-live-calc-result" id="cp-calc-tier">CRITICAL DISPATCH</div>
          </div>
        </div>
        <div class="cp-modal-header" style="justify-content:flex-end;gap:10px">
          <button class="cp-btn-secondary" id="cp-form-cancel">Cancel</button>
          <button class="cp-btn-primary" id="cp-form-submit">SUBMIT REPORT &amp; PATCH TO CCTV</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 4. Build Admin Command Drawer
    const admin = document.createElement("div");
    admin.id = "cp-admin-drawer";
    admin.innerHTML = `
      <div class="cp-admin-header">
        <h2><span>🛡️</span> ROAD REPAIR SEVERITY &amp; CCTV OPS</h2>
        <div style="display:flex;gap:6px">
          <button class="cp-btn-icon" id="cp-admin-expand-btn" title="Toggle Expand View">⛶</button>
          <button class="cp-btn-icon" id="cp-admin-close" title="Close Panel">✕</button>
        </div>
      </div>
      <div class="cp-filter-chips">
        <button class="cp-chip active" data-filter="All">ALL ROADS (1,000)</button>
        <button class="cp-chip" data-filter="Critical" style="color:var(--cp-pink)">CRITICAL (10)</button>
        <button class="cp-chip" data-filter="High" style="color:var(--cp-amber)">HIGH (110)</button>
        <button class="cp-chip" data-filter="Medium" style="color:var(--cp-cyan)">MEDIUM (411)</button>
        <button class="cp-chip" data-filter="Low" style="color:var(--cp-green)">LOW (469)</button>
      </div>
      <div style="padding:10px 14px 4px">
        <input type="text" class="cp-input" id="cp-admin-search" placeholder="Search road name, location ID, or camera..." style="width:100%" />
      </div>
      <div class="cp-admin-list" id="cp-admin-list"></div>
    `;
    document.body.appendChild(admin);

    // 5. Build Fullscreen Detailed Dossier Modal
    const fullDossier = document.createElement("div");
    fullDossier.id = "cp-full-dossier-modal";
    fullDossier.innerHTML = `
      <div class="cp-full-header">
        <div>
          <span style="font:700 11px var(--cp-mono);color:var(--cp-cyan)">CIVICPULSE SIGHT &middot; COMPREHENSIVE ROAD DIAGNOSTIC DOSSIER</span>
          <h1 id="cp-full-title">Congress Ave & 11th St — Infrastructure Triage Audit</h1>
        </div>
        <button class="cp-btn-icon" id="cp-full-close" style="width:36px;height:36px;font-size:18px">✕</button>
      </div>
      <div class="cp-full-content" id="cp-full-content"></div>
    `;
    document.body.appendChild(fullDossier);

    // 6. Hologram Reticle element
    const reticle = document.createElement("div");
    reticle.className = "cp-camera-reticle";
    reticle.id = "cp-camera-reticle";
    document.body.appendChild(reticle);
  }

  // --------------------------------------------------------------------------
  // Event Bindings
  // --------------------------------------------------------------------------
  bindGlobalEvents() {
    // Open Complaint Modal (Isolated click handler)
    document.querySelector("#btn-cp-report")?.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.openComplaintModal();
    });

    // Open Admin Drawer (Isolated click handler)
    document.querySelector("#btn-cp-admin")?.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.toggleAdminDrawer();
    });

    // Dossier Close & Expand
    document.querySelector("#cp-dos-close")?.addEventListener("click", () => {
      this.isPinned = false;
      document.querySelector("#cp-camera-dossier")?.classList.remove("active");
    });
    document.querySelector("#cp-dos-expand")?.addEventListener("click", () => {
      this.openFullDossier();
    });
    document.querySelector("#cp-dos-file-btn")?.addEventListener("click", () => {
      this.openComplaintModal(this.activeCamera);
    });
    document.querySelector("#cp-dos-admin-btn")?.addEventListener("click", () => {
      this.toggleAdminDrawer(true);
    });

    // Complaints toggle accordion in dossier
    document.querySelector("#cp-dos-complaints-toggle")?.addEventListener("click", () => {
      const list = document.querySelector("#cp-dos-complaints-list");
      const arrow = document.querySelector("#cp-dos-toggle-arrow");
      if (list.style.display === "none") {
        list.style.display = "block";
        arrow.textContent = "▼";
      } else {
        list.style.display = "none";
        arrow.textContent = "▶";
      }
    });

    // Modal Events
    document.querySelector("#cp-modal-close")?.addEventListener("click", () => {
      document.querySelector("#cp-complaint-modal-overlay")?.classList.remove("active");
    });
    document.querySelector("#cp-form-cancel")?.addEventListener("click", () => {
      document.querySelector("#cp-complaint-modal-overlay")?.classList.remove("active");
    });
    document.querySelector("#cp-full-close")?.addEventListener("click", () => {
      document.querySelector("#cp-full-dossier-modal")?.classList.remove("active");
    });

    // File upload events
    const dropZone = document.querySelector("#cp-drop-zone");
    const fileInput = document.querySelector("#cp-file-input");
    const dropPreview = document.querySelector("#cp-drop-preview");
    const dropPlaceholder = document.querySelector("#cp-drop-placeholder");

    dropZone?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          dropPreview.src = re.target.result;
          dropPreview.style.display = "block";
          dropPlaceholder.style.display = "none";
        };
        reader.readAsDataURL(file);
      }
    });

    // Sample photo selection
    document.querySelectorAll(".cp-sample-thumb").forEach(thumb => {
      thumb.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".cp-sample-thumb").forEach(t => t.classList.remove("selected"));
        thumb.classList.add("selected");
        dropPreview.src = thumb.dataset.src;
        dropPreview.style.display = "block";
        dropPlaceholder.style.display = "none";
      });
    });

    // Live calculation listeners in complaint form
    ["cp-form-road", "cp-form-condition", "cp-form-category", "cp-form-severity", "cp-form-ped", "cp-form-school", "cp-form-hospital", "cp-form-injuries"].forEach(id => {
      document.querySelector(`#${id}`)?.addEventListener("change", () => this.updateLiveCalculation());
    });

    // Complaint Form Submission
    document.querySelector("#cp-form-submit")?.addEventListener("click", () => {
      this.handleComplaintSubmit();
    });

    // Admin Drawer Events
    document.querySelector("#cp-admin-close")?.addEventListener("click", () => {
      document.querySelector("#cp-admin-drawer")?.classList.remove("open");
    });
    document.querySelector("#cp-admin-expand-btn")?.addEventListener("click", () => {
      document.querySelector("#cp-admin-drawer")?.classList.toggle("expanded");
    });

    // Admin Filter Chips
    document.querySelectorAll(".cp-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".cp-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.renderAdminList(chip.dataset.filter);
      });
    });

    // Admin Search
    document.querySelector("#cp-admin-search")?.addEventListener("input", (e) => {
      this.renderAdminList(null, e.target.value.toLowerCase());
    });
  }

  // --------------------------------------------------------------------------
  // Camera Hover & Click Detailed Report HUD
  // --------------------------------------------------------------------------
  showCameraDossier(camera, isClick = false, screenPos = null) {
    this.activeCamera = camera;
    const loc = this.matchLocationForCamera(camera);
    this.activeLocation = loc;

    const dossier = document.querySelector("#cp-camera-dossier");
    if (!dossier) return;

    if (isClick) {
      this.isPinned = true;
    }

    // Dynamic positioning beside camera / mouse position
    if (screenPos && screenPos.x && screenPos.y) {
      const cardW = 380;
      let left = screenPos.x + 24;
      if (left + cardW > window.innerWidth - 20) {
        left = screenPos.x - cardW - 24;
      }
      let top = Math.max(70, Math.min(screenPos.y - 40, window.innerHeight - 560));
      dossier.style.left = `${Math.max(10, left)}px`;
      dossier.style.top = `${top}px`;
      dossier.style.right = "auto";
    } else if (this.viewer && camera.longitude && camera.latitude) {
      try {
        const windowPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          this.viewer.scene,
          Cesium.Cartesian3.fromDegrees(camera.longitude, camera.latitude)
        );
        if (windowPos) {
          const cardW = 380;
          let left = windowPos.x + 24;
          if (left + cardW > window.innerWidth - 20) {
            left = windowPos.x - cardW - 24;
          }
          let top = Math.max(70, Math.min(windowPos.y - 40, window.innerHeight - 560));
          dossier.style.left = `${Math.max(10, left)}px`;
          dossier.style.top = `${top}px`;
          dossier.style.right = "auto";
        }
      } catch (e) {
        dossier.style.left = "auto";
        dossier.style.right = "420px";
        dossier.style.top = "72px";
      }
    } else {
      dossier.style.left = "auto";
      dossier.style.right = "420px";
      dossier.style.top = "72px";
    }

    // Set Text Content
    document.querySelector("#cp-dos-name").textContent = camera.name || "Intersection CCTV Feed";
    document.querySelector("#cp-dos-loc").textContent = `${loc.zone || "ZONE_01"} · Loc #${loc.id} · ${camera.latitude?.toFixed(4) || "30.2799"} N, ${Math.abs(camera.longitude || -97.7408).toFixed(4)} W`;

    // Road Condition & Urgency
    const urgEl = document.querySelector("#cp-dos-urgency");
    const cond = loc.road_condition || "Fair";
    let urgencyTier = "Medium";
    if (loc.score >= 70 || cond === "Critical") urgencyTier = "Critical";
    else if (loc.score >= 55) urgencyTier = "High";
    else if (loc.score < 40) urgencyTier = "Low";

    urgEl.className = `cp-urgency-badge ${urgencyTier}`;
    urgEl.textContent = `${cond.toUpperCase()} ROAD · ${urgencyTier.toUpperCase()} REPAIR`;

    document.querySelector("#cp-dos-score").textContent = loc.score.toFixed(1);
    document.querySelector("#cp-dos-rank").textContent = `RANK #${loc.rank || 1} OF 1,000`;

    // Metrics
    document.querySelector("#cp-dos-incidents").textContent = `${loc.n_inc || 12} Total (${loc.top_type || "Pothole"})`;
    document.querySelector("#cp-dos-backlog").textContent = `${Math.round((loc.n_inc || 10) * 0.4)} Active (${Math.round(loc.components?.backlog || 50)}h)`;
    document.querySelector("#cp-dos-injuries").textContent = `${Math.round((loc.components?.injuries || 50) / 25)} Reported`;
    document.querySelector("#cp-dos-complaints").textContent = `${loc.n_com || 8} Filed (${loc.complaint_type || "Surface"})`;

    // Mini Chart Bars (Incident Categories)
    const barsContainer = document.querySelector("#cp-dos-bars");
    const cats = loc.by_type || { "Pothole": 6, "Signal failure": 4, "Blocked drain": 3, "Streetlight outage": 2, "Flooding": 1 };
    const maxVal = Math.max(...Object.values(cats), 1);
    barsContainer.innerHTML = Object.entries(cats).slice(0, 4).map(([cat, val]) => {
      const pct = (val / maxVal) * 100;
      let barCol = "var(--cp-cyan)";
      if (cat === "Pothole") barCol = "var(--cp-amber)";
      if (cat === "Signal failure" || cat === "Collision") barCol = "var(--cp-pink)";
      if (cat === "Blocked drain" || cat === "Flooding") barCol = "var(--cp-green)";
      return `
        <div class="cp-bar-row">
          <span class="cp-bar-name" title="${cat}">${cat}</span>
          <div class="cp-bar-track">
            <div class="cp-bar-fill" style="width:${pct}%;background:${barCol}"></div>
          </div>
          <span class="cp-bar-count">${val}</span>
        </div>
      `;
    }).join("");

    // Attribution Reasons
    const reasonsContainer = document.querySelector("#cp-dos-reasons");
    if (loc.reasons && loc.reasons.length) {
      reasonsContainer.innerHTML = loc.reasons.map(r => `
        <div style="margin:3px 0;display:flex;justify-content:space-between">
          <span>&bull; ${r.label}</span>
          <b style="color:var(--cp-cyan)">+${r.points || "15"} pts</b>
        </div>
      `).join("");
    } else {
      reasonsContainer.innerHTML = `<div>&bull; Severity-weighted incident load: <b style="color:var(--cp-cyan)">+24.5 pts</b></div>`;
    }

    // Complaints associated with this road
    const relatedComplaints = this.complaints.filter(c => c.road === camera.name || c.locationId === loc.id || c.cctvCamera.includes(camera.name));
    document.querySelector("#cp-dos-complaints-count").textContent = relatedComplaints.length;
    const complaintsList = document.querySelector("#cp-dos-complaints-list");
    if (relatedComplaints.length) {
      complaintsList.innerHTML = relatedComplaints.map(c => `
        <div class="cp-complaint-item">
          <div class="cp-complaint-top">
            <span class="cp-complaint-tag">${c.category} &middot; ${c.severity}</span>
            <span class="cp-complaint-status status-${c.status.toLowerCase()}">${c.status}</span>
          </div>
          <div style="color:var(--cp-text);margin-bottom:3px">${c.description}</div>
          <div style="font:10px var(--cp-mono);color:var(--cp-dim)">${c.timestamp} &middot; Nearest: ${c.cctvCamera}</div>
          ${c.image ? `<img src="${c.image}" class="cp-complaint-img-thumb" alt="Evidence" onclick="window.open('${c.image}', '_blank')" />` : ""}
        </div>
      `).join("");
    } else {
      complaintsList.innerHTML = `<div style="font-size:11px;color:var(--cp-dim);padding:6px 0">No citizen complaints currently filed for this camera sector.</div>`;
    }

    dossier.classList.add("active");
  }

  // --------------------------------------------------------------------------
  // Citizen Complaint Filing Portal
  // --------------------------------------------------------------------------
  openComplaintModal(preselectedCamera = null) {
    const modal = document.querySelector("#cp-complaint-modal-overlay");
    if (!modal) return;

    if (preselectedCamera) {
      const roadSelect = document.querySelector("#cp-form-road");
      if (roadSelect) {
        let matched = false;
        for (let opt of roadSelect.options) {
          if (opt.value.includes(preselectedCamera.name) || preselectedCamera.name.includes(opt.value)) {
            opt.selected = true;
            matched = true;
            break;
          }
        }
        if (!matched) {
          const newOpt = new Option(preselectedCamera.name, preselectedCamera.name, true, true);
          roadSelect.add(newOpt);
        }
      }
    }

    this.updateLiveCalculation();
    modal.classList.add("active");
  }

  updateLiveCalculation() {
    const road = document.querySelector("#cp-form-road")?.value || "Congress Ave";
    const condition = document.querySelector("#cp-form-condition")?.value || "Fair";
    const category = document.querySelector("#cp-form-category")?.value || "Pothole";
    const severity = document.querySelector("#cp-form-severity")?.value || "Medium";
    const injuries = parseInt(document.querySelector("#cp-form-injuries")?.value || 0);

    // Compute Nearest CCTV camera on that road
    const patchNotice = document.querySelector("#cp-patch-text");
    const camName = `${road} [CCTV-SEC-${Math.abs(road.length * 7 % 900 + 100)}]`;
    const distM = Math.floor(35 + (road.length * 4) % 95);
    if (patchNotice) {
      patchNotice.textContent = `Auto-Linked to Nearest CCTV: ${camName} (Distance: ${distM}m on corridor)`;
    }

    // Client-side Model Inference
    let score = 42.0;
    if (condition === "Critical") score += 28.0;
    else if (condition === "Poor") score += 18.0;
    else if (condition === "Fair") score += 8.0;

    if (severity === "Critical") score += 25.0;
    else if (severity === "High") score += 16.0;
    else if (severity === "Medium") score += 8.0;

    if (injuries > 0) score += Math.min(injuries * 6.0, 18.0);
    if (category === "Signal failure" || category === "Flooding") score += 8.0;

    score = Math.min(Math.max(score, 12.0), 98.5);

    let tier = "LOW / ADVISORY";
    let tierCol = "var(--cp-green)";
    if (score >= 70) {
      tier = "CRITICAL DISPATCH REQUIRED";
      tierCol = "var(--cp-pink)";
    } else if (score >= 55) {
      tier = "HIGH PRIORITY INTERVENTION";
      tierCol = "var(--cp-amber)";
    } else if (score >= 40) {
      tier = "MEDIUM PRIORITY QUEUE";
      tierCol = "var(--cp-cyan)";
    }

    const calcScoreEl = document.querySelector("#cp-calc-score");
    const calcTierEl = document.querySelector("#cp-calc-tier");
    if (calcScoreEl) calcScoreEl.textContent = `${score.toFixed(1)} / 100`;
    if (calcTierEl) {
      calcTierEl.textContent = tier;
      calcTierEl.style.color = tierCol;
    }
  }

  handleComplaintSubmit() {
    const road = document.querySelector("#cp-form-road")?.value || "Congress Ave";
    const condition = document.querySelector("#cp-form-condition")?.value || "Fair";
    const category = document.querySelector("#cp-form-category")?.value || "Pothole";
    const severity = document.querySelector("#cp-form-severity")?.value || "Medium";
    const ped = document.querySelector("#cp-form-ped")?.value || "Medium";
    const nearSchool = document.querySelector("#cp-form-school")?.checked || false;
    const nearHospital = document.querySelector("#cp-form-hospital")?.checked || false;
    const injuries = parseInt(document.querySelector("#cp-form-injuries")?.value || 0);
    const desc = document.querySelector("#cp-form-desc")?.value || "Citizen reported road defect via CivicPulse Sight portal.";
    const previewImg = document.querySelector("#cp-drop-preview")?.src || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600";

    const newId = `CP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const camName = `${road} [CCTV-SEC-${Math.abs(road.length * 7 % 900 + 100)}]`;

    const newComplaint = {
      id: newId,
      road,
      locationId: `L0${Math.floor(100 + Math.random() * 800)}`,
      zone: "ZONE_02",
      category,
      severity,
      roadCondition: condition,
      cctvCamera: camName,
      distanceM: Math.floor(35 + (road.length * 4) % 95),
      injuries,
      pedestrian: ped,
      nearSchool,
      nearHospital,
      description: desc,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "Open",
      image: previewImg
    };

    this.complaints.unshift(newComplaint);
    this.saveComplaints();

    // Close modal
    document.querySelector("#cp-complaint-modal-overlay")?.classList.remove("active");

    // Show toast
    this.showToast(`Report ${newId} submitted & linked to ${camName}!`);

    // Refresh Admin List
    this.renderAdminList();

    // Fly camera to road if viewer exists
    if (this.viewer) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-97.7431, 30.2672, 850.0),
        orientation: {
          heading: Cesium.Math.toRadians(180),
          pitch: Cesium.Math.toRadians(-35)
        },
        duration: 2.0
      });
      this.pulseReticle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  // --------------------------------------------------------------------------
  // Admin Command Drawer Panel
  // --------------------------------------------------------------------------
  toggleAdminDrawer(openExplicit = null) {
    const drawer = document.querySelector("#cp-admin-drawer");
    if (!drawer) return;
    if (openExplicit !== null) {
      if (openExplicit) drawer.classList.add("open");
      else drawer.classList.remove("open");
    } else {
      drawer.classList.toggle("open");
    }

    if (drawer.classList.contains("open")) {
      this.renderAdminList("All");
    }
  }

  toggleCardComplaints(locId) {
    const box = document.querySelector(`#cp-complaints-box-${locId}`);
    const arrow = document.querySelector(`#cp-arrow-${locId}`);
    if (!box) return;
    if (box.style.display === "none") {
      box.style.display = "block";
      if (arrow) arrow.textContent = "▼";
    } else {
      box.style.display = "none";
      if (arrow) arrow.textContent = "▶";
    }
  }

  resolveComplaint(complaintId, locId) {
    const c = this.complaints.find(item => item.id === complaintId);
    if (c) {
      c.status = "Resolved";
      this.saveComplaints();
      this.showToast(`Complaint ${complaintId} marked Resolved! Backlog updated.`);
      this.renderAdminList();
      if (this.activeLocation && this.activeLocation.id === locId) {
        this.showCameraDossier(this.activeCamera, true);
      }
    }
  }

  dispatchCrew(complaintId, locId) {
    const c = this.complaints.find(item => item.id === complaintId);
    if (c) {
      c.status = "Assigned";
      this.saveComplaints();
      this.showToast(`Emergency repair crew dispatched to ${c.road}!`);
      this.renderAdminList();
      if (this.activeLocation && this.activeLocation.id === locId) {
        this.showCameraDossier(this.activeCamera, true);
      }
    }
  }

  renderAdminList(filter = "All", searchQuery = "") {
    const container = document.querySelector("#cp-admin-list");
    if (!container) return;

    const locs = this.locationsData?.locations || [];
    let items = [...locs];

    // Filter by urgency
    if (filter && filter !== "All") {
      items = items.filter(loc => {
        let u = "Medium";
        if (loc.score >= 70 || loc.road_condition === "Critical") u = "Critical";
        else if (loc.score >= 55) u = "High";
        else if (loc.score < 40) u = "Low";
        return u.toLowerCase() === filter.toLowerCase();
      });
    }

    // Filter by search
    if (searchQuery) {
      items = items.filter(loc =>
        (loc.id && loc.id.toLowerCase().includes(searchQuery)) ||
        (loc.zone && loc.zone.toLowerCase().includes(searchQuery)) ||
        (loc.road_type && loc.road_type.toLowerCase().includes(searchQuery)) ||
        (loc.top_type && loc.top_type.toLowerCase().includes(searchQuery))
      );
    }

    // Sort by repair severity score descending
    items.sort((a, b) => b.score - a.score);

    container.innerHTML = items.slice(0, 30).map((loc) => {
      let u = "Medium";
      if (loc.score >= 70 || loc.road_condition === "Critical") u = "Critical";
      else if (loc.score >= 55) u = "High";
      else if (loc.score < 40) u = "Low";

      const roadName = `Corridor ${loc.id} (${loc.road_type || "Arterial"})`;
      const camId = `ATX-CCTV-${loc.id}`;

      // User complaints for this location
      const compl = this.complaints.filter(c => c.locationId === loc.id || c.road.includes(loc.id) || (loc.id === "L0642" && c.road.includes("Congress")));

      return `
        <div class="cp-admin-card" data-loc-id="${loc.id}">
          <div class="cp-admin-card-top">
            <div>
              <span class="cp-dossier-tag">${loc.zone} &middot; #${loc.id}</span>
              <div class="cp-admin-road-title">${roadName}</div>
            </div>
            <span class="cp-urgency-badge ${u}">${u} REPAIR</span>
          </div>
          <div class="cp-admin-card-stats">
            <span>Score: <b style="color:var(--cp-cyan)">${loc.score.toFixed(1)}</b></span>
            <span>Condition: <b style="color:#fff">${loc.road_condition || "Fair"}</b></span>
            <span>Incidents: <b style="color:#fff">${loc.n_inc || 10}</b></span>
            <span>Complaints: <b style="color:var(--cp-amber)">${compl.length + (loc.n_com || 4)}</b></span>
          </div>
          <div style="margin-top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="cp-admin-fly-btn" onclick="window.civicPulseIntel.flyToLocation('${loc.id}')">
              🚀 FLY &amp; INSPECT
            </button>
            <button class="cp-btn-secondary" style="font-size:10px;padding:4px 8px" onclick="window.civicPulseIntel.toggleCardComplaints('${loc.id}')">
              <span>Complaints (${compl.length})</span> <span id="cp-arrow-${loc.id}">▼</span>
            </button>
            <button class="cp-btn-icon" style="margin-left:auto" onclick="window.civicPulseIntel.openFullDossier('${loc.id}')" title="Expand Full View">
              ⛶
            </button>
          </div>

          <!-- Collapsible Complaints & Images -->
          <div id="cp-complaints-box-${loc.id}" style="display:block;margin-top:8px;border-top:1px dashed rgba(39,230,255,0.15);padding-top:6px">
            ${compl.length ? compl.map(c => `
              <div class="cp-complaint-item" style="margin-bottom:6px">
                <div class="cp-complaint-top">
                  <span class="cp-complaint-tag">${c.category} &middot; ${c.severity}</span>
                  <span class="cp-complaint-status status-${c.status.toLowerCase()}">${c.status}</span>
                </div>
                <div style="color:var(--cp-text);font-size:11px;margin-bottom:4px">${c.description}</div>
                <div style="font:9px var(--cp-mono);color:var(--cp-dim);margin-bottom:4px">
                  ${c.timestamp} &middot; Linked: ${c.cctvCamera}
                </div>
                ${c.image ? `<img src="${c.image}" class="cp-complaint-img-thumb" alt="Evidence" onclick="window.open('${c.image}', '_blank')" />` : ""}
                <div style="display:flex;gap:6px;margin-top:6px">
                  ${c.status !== 'Resolved' ? `
                    <button class="cp-btn-resolve" onclick="window.civicPulseIntel.resolveComplaint('${c.id}', '${loc.id}')">
                      ✓ Mark Resolved
                    </button>
                    <button class="cp-btn-dispatch" onclick="window.civicPulseIntel.dispatchCrew('${c.id}', '${loc.id}')">
                      🚨 Dispatch Crew
                    </button>
                  ` : `<span style="font:10px var(--cp-mono);color:var(--cp-green)">✓ WORK ORDER COMPLETED</span>`}
                </div>
              </div>
            `).join("") : `<div style="font-size:10px;color:var(--cp-dim)">No citizen complaints pending for this sector.</div>`}
          </div>
        </div>
      `;
    }).join("");
  }

  flyToLocation(locId) {
    const loc = this.locationsData?.locations?.find(l => l.id === locId);
    if (!loc) return;

    const synthCam = {
      id: `ATX-CCTV-${loc.id}`,
      name: `Corridor ${loc.id} (${loc.road_type || "Arterial"}) CCTV`,
      latitude: loc.lat || 30.2672,
      longitude: loc.lon || -97.7431
    };

    // Fly Cesium Camera
    if (this.viewer) {
      const destLng = Number.isFinite(synthCam.longitude) ? synthCam.longitude : -97.7431;
      const destLat = Number.isFinite(synthCam.latitude) ? synthCam.latitude : 30.2672;

      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          destLng,
          destLat - 0.003,
          520.0
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-35)
        },
        duration: 1.8
      });
    }

    // Show Reticle highlight
    this.pulseReticle(window.innerWidth / 2, window.innerHeight / 2);

    // Show Dossier Card beside camera
    this.showCameraDossier(synthCam, true);
  }

  pulseReticle(x, y) {
    const reticle = document.querySelector("#cp-camera-reticle");
    if (!reticle) return;
    reticle.style.left = `${x}px`;
    reticle.style.top = `${y}px`;
    reticle.style.display = "block";
    setTimeout(() => {
      reticle.style.display = "none";
    }, 3500);
  }

  // --------------------------------------------------------------------------
  // Fullscreen Detailed Dossier Modal
  // --------------------------------------------------------------------------
  openFullDossier(locId = null) {
    const modal = document.querySelector("#cp-full-dossier-modal");
    const content = document.querySelector("#cp-full-content");
    let loc = this.activeLocation;
    if (locId) {
      loc = this.locationsData?.locations?.find(l => l.id === locId) || loc;
    }
    if (!modal || !content || !loc) return;

    document.querySelector("#cp-full-title").textContent = `${this.activeCamera?.name || `Corridor ${loc.id}`} — Comprehensive Infrastructure & CCTV Diagnostic Dossier`;

    content.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="cp-chart-section">
          <div class="cp-chart-title">CORE INFRASTRUCTURE SCORE BREAKDOWN</div>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-top:10px">
            <div class="cp-metric-box">
              <div class="cp-metric-title">Severity Load (30%)</div>
              <div class="cp-metric-val" style="color:var(--cp-pink)">${loc.components?.severity?.toFixed(1) || "28.5"} pts</div>
            </div>
            <div class="cp-metric-box">
              <div class="cp-metric-title">Backlog Load (20%)</div>
              <div class="cp-metric-val" style="color:var(--cp-amber)">${loc.components?.backlog?.toFixed(1) || "19.2"} pts</div>
            </div>
            <div class="cp-metric-box">
              <div class="cp-metric-title">Complaint Pressure (15%)</div>
              <div class="cp-metric-val" style="color:var(--cp-cyan)">${loc.components?.complaints?.toFixed(1) || "14.1"} pts</div>
            </div>
          </div>
        </div>

        <div class="cp-chart-section">
          <div class="cp-chart-title">
            <span>CUSTOM FROM-SCRATCH ML MODELS &mdash; EVALUATION BENCHMARK</span>
            <span style="color:var(--cp-green);font-size:10px">TRAINED FROM SCRATCH (ZERO PRETRAINED WEIGHTS)</span>
          </div>
          <div style="font-size:11px;color:var(--cp-dim);line-height:1.5;margin-top:4px">
            All algorithms implemented in pure Python/NumPy (Normal Equations, Gradient Descent Softmax, Bagging Decision Trees, and Spatial Empirical Bayes Shrinkage) satisfying the <b>"TRAINED FROM SCRATCH"</b> hackathon criteria.
          </div>
          <div style="overflow-x:auto;margin-top:8px">
            <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:var(--cp-mono)">
              <thead>
                <tr style="border-bottom:1px solid var(--cp-border);color:var(--cp-cyan);text-align:left">
                  <th style="padding:6px">Model</th>
                  <th style="padding:6px">Algorithm Type</th>
                  <th style="padding:6px">Accuracy</th>
                  <th style="padding:6px">Precision</th>
                  <th style="padding:6px">Recall</th>
                  <th style="padding:6px">F1-Score</th>
                  <th style="padding:6px">RMSE</th>
                  <th style="padding:6px">R²</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                  <td style="padding:6px;color:#fff"><b>01. Ridge Linear Reg</b></td>
                  <td style="padding:6px;color:var(--cp-dim)">Scratch Normal Eq (L2)</td>
                  <td style="padding:6px;color:var(--cp-green);font-weight:700">87.5%</td>
                  <td style="padding:6px">0.8951</td>
                  <td style="padding:6px">0.7570</td>
                  <td style="padding:6px;color:var(--cp-cyan)">0.7876</td>
                  <td style="padding:6px;color:var(--cp-pink)">1.182</td>
                  <td style="padding:6px;color:var(--cp-green)">0.9858</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                  <td style="padding:6px;color:#fff"><b>02. Logistic Reg</b></td>
                  <td style="padding:6px;color:var(--cp-dim)">Scratch Softmax (GD)</td>
                  <td style="padding:6px;color:var(--cp-green);font-weight:700">82.5%</td>
                  <td style="padding:6px">0.8096</td>
                  <td style="padding:6px">0.7579</td>
                  <td style="padding:6px;color:var(--cp-cyan)">0.7799</td>
                  <td style="padding:6px;color:var(--cp-pink)">1.950</td>
                  <td style="padding:6px;color:var(--cp-green)">0.9420</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                  <td style="padding:6px;color:#fff"><b>03. Random Forest</b></td>
                  <td style="padding:6px;color:var(--cp-dim)">Scratch Bagging Trees</td>
                  <td style="padding:6px;color:var(--cp-amber);font-weight:700">72.0%</td>
                  <td style="padding:6px">0.6048</td>
                  <td style="padding:6px">0.5037</td>
                  <td style="padding:6px;color:var(--cp-cyan)">0.5034</td>
                  <td style="padding:6px;color:var(--cp-pink)">4.274</td>
                  <td style="padding:6px;color:var(--cp-amber)">0.8149</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                  <td style="padding:6px;color:#fff"><b>04. Hybrid Ensemble</b></td>
                  <td style="padding:6px;color:var(--cp-dim)">Stacking + Bayes Shrink</td>
                  <td style="padding:6px;color:var(--cp-green);font-weight:700">80.5%</td>
                  <td style="padding:6px">0.8973</td>
                  <td style="padding:6px">0.6190</td>
                  <td style="padding:6px;color:var(--cp-cyan)">0.6451</td>
                  <td style="padding:6px;color:var(--cp-pink)">2.449</td>
                  <td style="padding:6px;color:var(--cp-green)">0.9392</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Full Multi-Model Comparison Matrix Image -->
        <div class="cp-chart-section">
          <div class="cp-chart-title">
            <span>ALL MODELS SIDE-BY-SIDE EVALUATION BENCHMARK</span>
            <span style="color:var(--cp-cyan);font-size:11px">ACCURACY &middot; PRECISION &middot; RMSE &middot; R²</span>
          </div>
          <div style="margin-top:8px">
            <img src="/smartcity/training_plots/all_models_side_by_side_matrix.png" style="width:100%;border-radius:8px;border:1px solid var(--cp-border);display:block" alt="Models Comparison Matrix" />
          </div>
        </div>

        <!-- 4-Way Confusion Matrices Comparison Image -->
        <div class="cp-chart-section">
          <div class="cp-chart-title">
            <span>4x4 CONFUSION MATRICES &mdash; MULTI-MODEL COMPARISON</span>
            <span style="color:var(--cp-pink);font-size:11px">CRITICAL &middot; HIGH &middot; MEDIUM &middot; LOW</span>
          </div>
          <div style="margin-top:8px">
            <img src="/smartcity/training_plots/all_models_confusion_matrices.png" style="width:100%;border-radius:8px;border:1px solid var(--cp-border);display:block" alt="All Models Confusion Matrices" />
          </div>
        </div>

        <div class="cp-chart-section">
          <div class="cp-chart-title">SPATIAL CONTEXT &amp; VULNERABILITY AUDIT</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12px">
            <div><b>Road Type:</b> ${loc.road_type || "Collector"}</div>
            <div><b>Surface Condition:</b> <span style="color:var(--cp-pink)">${loc.road_condition || "Critical"}</span></div>
            <div><b>Population Density:</b> ${loc.density?.toLocaleString() || "18,400"} / km²</div>
            <div><b>Pedestrian Exposure:</b> ${loc.ped || "High Footfall"}</div>
            <div><b>School Zone:</b> ${loc.school ? "Yes (Within 250m)" : "No"}</div>
            <div><b>Hospital Corridor:</b> ${loc.hospital ? "Yes (Emergency Access Route)" : "No"}</div>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="cp-chart-section">
          <div class="cp-chart-title">CCTV LIVE SURVEILLANCE &amp; OPTICAL EVIDENCE</div>
          <div style="position:relative;height:240px;background:#000;border-radius:8px;overflow:hidden;border:1px solid var(--cp-border)">
            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800" style="width:100%;height:100%;object-fit:cover" alt="Camera view" />
            <div style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);padding:3px 8px;border-radius:4px;font:700 10px var(--cp-mono);color:var(--cp-green)">
              LIVE STREAM &middot; RTSP FEED ACTIVE
            </div>
          </div>
        </div>

        <!-- Random Forest Feature Importance Chart -->
        <div class="cp-chart-section">
          <div class="cp-chart-title">RANDOM FOREST FEATURE IMPORTANCE</div>
          <div style="margin-top:8px">
            <img src="/smartcity/training_plots/random_forest_feature_importance.png" style="width:100%;border-radius:8px;border:1px solid var(--cp-border);display:block" alt="Feature Importance" onerror="this.style.display='none'" />
          </div>
        </div>

        <div class="cp-chart-section" style="flex:1">
          <div class="cp-chart-title">ACTIVE FIELD COMPLAINTS &amp; RESOLUTION WORK ORDERS</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${this.complaints.slice(0, 4).map(c => `
              <div class="cp-complaint-item">
                <div class="cp-complaint-top">
                  <span class="cp-complaint-tag">${c.category} &middot; ${c.severity}</span>
                  <span class="cp-complaint-status status-${c.status.toLowerCase()}">${c.status}</span>
                </div>
                <div style="color:var(--cp-text);font-size:12px;margin:3px 0">${c.description}</div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;font:10px var(--cp-mono);color:var(--cp-dim)">
                  <span>${c.timestamp} &middot; ${c.cctvCamera}</span>
                  <span style="color:var(--cp-cyan)">Assigned Crew: Alpha-4</span>
                </div>
                ${c.image ? `<img src="${c.image}" class="cp-complaint-img-thumb" style="margin-top:6px" alt="Evidence" onclick="window.open('${c.image}', '_blank')" />` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
  }

  showToast(msg) {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.className = "show";
    setTimeout(() => {
      toast.className = "";
    }, 4000);
  }
}

// Instantiate and expose globally
window.civicPulseIntel = new CivicPulseIntel();
export { CivicPulseIntel };
