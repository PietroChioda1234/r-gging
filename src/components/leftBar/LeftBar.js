import {
  findIndexFromLatLon,
  fillBar,
} from "../../utilities/contextMenuFunctions";

export default function LeftBar() {
  async function getMarker(marker_lon, marker_lat) {
    return fetch(
      "http://localhost:3000/marker?lat=" + marker_lat + "&lon=" + marker_lon
    )
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        return json;
      });
  }
  function refresh() {
    document.getElementById("refresher").classList.remove("stopIcon");
    document.getElementById("refresher").classList.add("rotateIcon");
  }
  function stop_refreshing() {
    document.getElementById("refresher").classList.remove("rotateIcon");
    document.getElementById("refresher").classList.add("stopIcon");
  }
  async function refresh_icon_controller() {
    refresh();
    const lon = parseFloat(sessionStorage.getItem("longitude"));
    const lat = parseFloat(sessionStorage.getItem("latitude"));
    try {
      if (findIndexFromLatLon({ lat: lat, lon: lon }) != null) {
        const marker = await getMarker(lon, lat);
        console.log(marker);

        if (marker) {
          fillBar(marker);
        }
      }
    } catch (e) {
      console.log("marker doesnt exist" + e);
    } finally {
      stop_refreshing();
    }
  }
  return (
    <div id="leftOpt">
      <div id="close_left_opt_btn" className="wrapper cursor-pointer">
        <div className="arrow">
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
      <div
        id="refresher"
        className="reloadSingle stopIcon"
        onClick={refresh_icon_controller}
      ></div>
      <p>SLOPES SCORE</p>
      <div className="grid grid-cols-2 gap-2 place-content-end mb-5 text-center antialiased font-sans z-10">
        <div className="bg-purple-500 rounded-lg shadow-xl min-h-[50px] content-center antialiased text-nowrap overflow-hidden">
          <div
            id="community_vote_fun"
            className="h-full w-full text-center content-center rounded-lg shadow-xl min-h-[0px]   "
          ></div>
        </div>

        <div className="bg-slate-500 rounded-lg shadow-xl min-h-[50px] content-center antialiased">
          <div
            id="dev_vote_fun"
            className="h-full w-full text-center content-center  rounded-lg shadow-xl min-h-[0px]  "
          ></div>
        </div>
      </div>
      <p>DANGER</p>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 grid-flow-row-dense mb-5">
        <div className="bg-orange-500 rounded-lg shadow-xl min-h-[50px] col-span-3">
          POLICE
        </div>
      </div>
      <p>MORE INFO</p>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 grid-flow-row-dense mb-5">
        <div className="bg-yellow-500 rounded-lg shadow-xl min-h-[80px] row-span-2 col-span-2">
          NEWS
        </div>

        <div
          id="curves"
          className="bg-blue-500 rounded-lg shadow-xl min-h-[80px] font-bold text-2xl "
        >
          Curves{" "}
          <p
            className="text-base font-semibold"
            style={{ margin: 5 + "px" }}
          ></p>
        </div>
        <div
          className="bg-indigo-500 rounded-lg shadow-xl min-h-[80px]"
          style={{ alignContent: "center" }}
        >
          <div id="left_top_short">
            <details className="dropdown">
              <summary role="button">
                <a
                  className="button fa fa-info-circle"
                  style={{ marginTop: "auto" }}
                ></a>
              </summary>
              <ul></ul>
            </details>
          </div>
        </div>
      </div>

      <div id="right_tall" className="relative h-0 w-0 ml-20">
        <div className="absolute inset-y-0 right-0 w-16 ..."></div>
      </div>

      <div
        id="user_vote"
        className="mx-2.5 cursor-pointer position-relative grid grid-cols-10 gap-2 inset-x-0 -top-30 absolute mb-5 text-center antialiased font-sans z-5"
      >
        <div className="bg-[#FF0000] hover:bg-[#DE0000] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#FF3300] hover:bg-[#DE2C00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#FF6600] hover:bg-[#DE5900] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#FF9900] hover:bg-[#DE8500] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#FFCC00] hover:bg-[#DEB100] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#FFFF00] hover:bg-[#DEDE00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#CCFF00] hover:bg-[#B1DE00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#99FF00] hover:bg-[#85DE00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#66FF00] hover:bg-[#59DE00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
        <div className="bg-[#33FF00] hover:bg-[#2CDE00] rounded-lg shadow-xl min-h-[40px] content-center antialiased text-nowrap overflow-hidden"></div>
      </div>

      <div className="place-content-end inset-x-0 bottom-0 absolute mb-5 text-center antialiased font-sans z-10 mx-2.5">
        <p className="relative bottom-12">OVERALL</p>

        <div className="grid grid-cols-2 gap-2 ">
          <div className="bg-purple-500 rounded-lg shadow-xl min-h-[50px] content-center antialiased text-nowrap overflow-hidden">
            COMMUNITY
          </div>

          <div className="bg-slate-500 rounded-lg shadow-xl min-h-[50px] content-center antialiased">
            DEV
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 place-content-end  inset-x-0 bottom-0 absolute mb-5 text-center antialiased font-sans mx-2.5 ">
        <div
          id="community_vote"
          className=" bg-red-500 rounded-lg shadow-xl min-h-[100px] text-center  text-2xl "
        ></div>

        <div
          id="dev_vote"
          className=" bg-red-500 rounded-lg shadow-xl min-h-[0px] text-center text-2xl "
        ></div>
      </div>
    </div>
  );
}
