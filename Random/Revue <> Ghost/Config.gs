const REVUE_API_KEY = "...";
const REVUE_LIST_ID = "..."; // run REVUE_API.listAllLists()
const GHOST_ACCESS_TOKEN = "...";
const GHOST_ADMIN_DOMAIN = "...";

const REVUE_BASE_URL = "https://www.getrevue.co/api";
const GHOST_BASE_URL = `https://${GHOST_ADMIN_DOMAIN}/ghost/api`;
const REVUE_SHEET_NAME = "Revue";
const GHOST_SHEET_NAME = "Ghost";

const scriptProperties = PropertiesService.getScriptProperties();

const startSync = () => importRevueList();

const continueSync = () => {
  let jwt = importGhostMembers();
  if (jwt) {
    if (syncWithGhost(jwt)) {
      if (syncWithRevue()) {
        console.log("Sync was successful!");
      } else {
        console.log("syncWithRevue() falied at startSync().");
      }
    } else {
      console.log("syncWithGhost(jwt) falied at startSync().");
    }
  } else {
    console.log("importGhostMembers() falied at startSync().");
  }
}

const scheduleSync = () => ScriptApp.newTrigger("importRevueList")
  .timeBased()
  .atHour(0)
  .nearMinute(1)
  .everyDays(1)
  .inTimezone(Session.getScriptTimeZone())
  .create();
