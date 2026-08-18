import React,{useMemo,useState}from"react";
import api from"../api";
import"../admin-dashboard.css";

const bookingTabs=["all","pending","accepted","started","completed","cancelled"];

function isDriverApproved(driver){
  return Boolean(driver?.driverProfile?.isApproved??driver?.approved);
}

function isDriverBlocked(driver){
  return driver?.accountStatus==="blocked"||Boolean(driver?.blocked);
}

function getVehicleType(driver){
  return driver?.driverProfile?.vehicle?.vehicleType||driver?.vehicleType||"Not added";
}

function getVehicleNumber(driver){
  return driver?.driverProfile?.vehicle?.registrationNumber||driver?.vehicleNumber||"Not added";
}

function getDriverWarnings(driver){
  return driver?.driverProfile?.warnings||driver?.warnings||[];
}

function getLocationName(location,fallback="Location"){
  if(!location)return fallback;

  if(typeof location==="string"){
    return location.trim()||fallback;
  }

  if(typeof location==="object"){
    return location.address||
      location.name||
      location.formattedAddress||
      location.landmark||
      location.city||
      fallback;
  }

  return fallback;
}

function getRideFare(ride){
  const value=
    ride?.estimatedFare??
    ride?.fare?.estimatedFare??
    ride?.fare?.totalFare??
    ride?.fare?.finalFare??
    0;

  const number=Number(value);
  return Number.isFinite(number)?number:0;
}

function AdminDashboard({
  user,
  stats,
  drivers=[],
  bookings=[],
  loadAdminData,
  loadBookings,
  notify,
  logout
}){
  const[activeSection,setActiveSection]=useState("dashboard");
  const[driverFilter,setDriverFilter]=useState("waiting");
  const[driverSearch,setDriverSearch]=useState("");
  const[bookingFilter,setBookingFilter]=useState("all");
  const[busyDriverId,setBusyDriverId]=useState("");
  const[openBookingId,setOpenBookingId]=useState("");
  const[docDriver,setDocDriver]=useState(null);
  const[docPreview,setDocPreview]=useState(null);
  const[docPreviewType,setDocPreviewType]=useState("image");
  const[docLoading,setDocLoading]=useState(false);
  const[docBusyId,setDocBusyId]=useState("");

  // NEW: Admin legal name verify states
  const[nameEditValue,setNameEditValue]=useState("");
  const[nameEditMode,setNameEditMode]=useState(false);
  const[nameBusy,setNameBusy]=useState(false);

  // Document verify / reject
  const verifyDocument=async(driver,doc,action)=>{
    let reason="";
    if(action==="reject"){
      reason=window.prompt("Reject karne ka reason likho:")||"";
      if(!reason.trim()){
        notify?.("Reject reason zaroori hai");
        return;
      }
    }
    try{
      setDocBusyId(doc._id);
      const{data}=await api.patch(
        `/admin/drivers/${driver._id}/documents/${doc._id}/${action}`,
        action==="reject"?{reason:reason.trim()}:{}
      );
      notify?.(data?.message||(action==="verify"?"Document verified!":"Document rejected!"));
      await loadAdminData?.();
      // docDriver update karo local state mein
      setDocDriver(prev=>{
        if(!prev||String(prev._id)!==String(driver._id))return prev;
        const updatedDocs=(prev.driverProfile?.documents||[]).map(d=>
          String(d._id)===String(doc._id)
            ?{...d,verificationStatus:action==="verify"?"verified":"rejected",rejectionReason:action==="reject"?reason:""}
            :d
        );
        return{
          ...prev,
          driverProfile:{
            ...prev.driverProfile,
            documents:updatedDocs
          }
        };
      });
    }catch(error){
      notify?.(error.response?.data?.message||"Document action failed");
    }finally{
      setDocBusyId("");
    }
  };

  // Auth token — correct key: "himrideg_token"
  const getAuthToken=()=>{
    return sessionStorage.getItem("himrideg_token")||
      sessionStorage.getItem("accessToken")||
      sessionStorage.getItem("token")||
      "";
  };

  // Private document ko api (axios, with auto token) se fetch karo → objectURL
  const viewDocument=async(driver,doc)=>{
    if(!doc?.documentUrl)return;
    setDocLoading(true);
    setDocPreview(null);
    try{
      // Use axios (api) with responseType blob — token auto-attached via interceptor
      const resp=await api.get(
        `/admin/drivers/${driver._id}/documents/${doc._id}/file`,
        {responseType:"blob"}
      );
      const blob=resp.data;
      const contentType=blob.type||"";
      const objectUrl=URL.createObjectURL(blob);
      setDocPreviewType(contentType.includes("pdf")?"pdf":"image");
      setDocPreview(objectUrl);
    }catch(err){
      alert("Document load nahi ho saka: "+(err.response?.data?.message||err.message));
    }finally{
      setDocLoading(false);
    }
  };

  const filteredDrivers=useMemo(()=>{
    const search=driverSearch.trim().toLowerCase();

    return drivers.filter(driver=>{
      const vehicleType=getVehicleType(driver).toLowerCase();
      const vehicleNumber=getVehicleNumber(driver).toLowerCase();

      const matchesSearch=
        !search||
        driver?.name?.toLowerCase().includes(search)||
        driver?.phone?.includes(search)||
        vehicleNumber.includes(search)||
        vehicleType.includes(search);

      const approved=isDriverApproved(driver);
      const blocked=isDriverBlocked(driver);
      const warnings=getDriverWarnings(driver);

      let matchesFilter=true;

      if(driverFilter==="approved"){
        matchesFilter=approved&&!blocked;
      }

      if(driverFilter==="waiting"){
        matchesFilter=!approved&&!blocked;
      }

      if(driverFilter==="blocked"){
        matchesFilter=blocked;
      }

      if(driverFilter==="warnings"){
        matchesFilter=warnings.length>0;
      }

      return matchesSearch&&matchesFilter;
    });
  },[drivers,driverSearch,driverFilter]);

  const filteredBookings=useMemo(()=>{
    if(bookingFilter==="all"){
      return bookings;
    }

    return bookings.filter(
      booking=>booking.status===bookingFilter
    );
  },[bookings,bookingFilter]);

  const waitingDrivers=drivers.filter(
    driver=>
      !isDriverApproved(driver)&&
      !isDriverBlocked(driver)
  );

  const approvedDrivers=drivers.filter(
    driver=>
      isDriverApproved(driver)&&
      !isDriverBlocked(driver)
  );

  const blockedDrivers=drivers.filter(
    isDriverBlocked
  );

  const refreshEverything=async()=>{
    try{
      await Promise.all([
        loadAdminData?.(),
        loadBookings?.()
      ]);

      notify?.("Data refreshed");
    }catch(error){
      notify?.(
        error.response?.data?.message||
        "Data refresh nahi ho saka"
      );
    }
  };

  const runDriverAction=async({
    driver,
    endpoint,
    body,
    successMessage
  })=>{
    try{
      setBusyDriverId(driver._id);

      const{data}=await api.patch(
        `/admin/drivers/${driver._id}/${endpoint}`,
        body
      );

      notify?.(data?.message||successMessage);
      await loadAdminData?.();
    }catch(error){
      const msg=error.response?.data?.message||"Driver action failed";
      notify?.(msg);
      // Agar approve fail hua to modal mein bhi alert dikho
      if(endpoint==="approve"){
        alert("⚠️ Approve Nahi Ho Saka:\n\n"+msg);
      }
    }finally{
      setBusyDriverId("");
    }
  };

  // NEW: Admin update & lock driver legal name
  const updateDriverLegalName=async(driver,newName,lock)=>{
    if(!newName?.trim()){notify?.("Naam khali nahi ho sakta");return;}
    try{
      setNameBusy(true);
      const{data}=await api.patch(
        `/admin/drivers/${driver._id}/legal-name`,
        {legalName:newName.trim(),lock:Boolean(lock)}
      );
      notify?.(data?.message||"Naam update ho gaya!");
      setNameEditMode(false);
      setDocDriver(prev=>{
        if(!prev||String(prev._id)!==String(driver._id))return prev;
        return{...prev,driverProfile:{...prev.driverProfile,legalName:newName.trim(),legalNameVerified:Boolean(lock)}};
      });
      await loadAdminData?.();
    }catch(error){
      notify?.(error.response?.data?.message||"Naam update nahi hua");
    }finally{setNameBusy(false);}
  };

  const approveDriver=async driver=>{
    await runDriverAction({
      driver,
      endpoint:"approve",
      successMessage:"Driver successfully approved"
    });

    setDriverFilter("waiting");
  };

  const rejectDriver=driver=>{
    const reason=window.prompt(
      `${driver.name} ki application reject karne ka reason likho:`
    );

    if(!reason?.trim()){
      notify?.("Reject reason required hai");
      return;
    }

    const confirmed=window.confirm(
      `Kya aap ${driver.name} ki application reject karna chahte hain?`
    );

    if(!confirmed)return;

    runDriverAction({
      driver,
      endpoint:"reject",
      body:{reason:reason.trim()},
      successMessage:"Driver application rejected"
    });
  };

  const warnDriver=driver=>{
    const message=window.prompt(
      `${driver.name} ko warning message likho:`
    );

    if(!message?.trim())return;

    const reason=
      window.prompt(
        "Warning ka reason likho (optional):"
      )||"";

    runDriverAction({
      driver,
      endpoint:"warning",
      body:{
        message:message.trim(),
        reason:reason.trim()
      },
      successMessage:"Warning sent"
    });
  };

  const blockDriver=driver=>{
    const reason=window.prompt(
      `${driver.name} ko block karne ka reason likho:`
    );

    if(!reason?.trim()){
      notify?.("Block reason required hai");
      return;
    }

    const confirmed=window.confirm(
      `Kya aap ${driver.name} ko block karna chahte hain?`
    );

    if(!confirmed)return;

    runDriverAction({
      driver,
      endpoint:"block",
      body:{reason:reason.trim()},
      successMessage:"Driver blocked"
    });
  };

  const unblockDriver=driver=>{
    const adminNote=
      window.prompt(
        "Unblock note likho (optional):"
      )||"";

    runDriverAction({
      driver,
      endpoint:"unblock",
      body:{adminNote:adminNote.trim()},
      successMessage:"Driver unblocked"
    });
  };

  const rejectUnblockRequest=driver=>{
    const adminNote=
      window.prompt(
        "Request reject karne ka reason likho:"
      )||"";

    if(!adminNote.trim())return;

    runDriverAction({
      driver,
      endpoint:"unblock-request/reject",
      body:{adminNote:adminNote.trim()},
      successMessage:"Unblock request rejected"
    });
  };

  const openDriverSection=(filter="waiting")=>{
    setDriverFilter(filter);
    setActiveSection("drivers");
  };

  const REQUIRED_DOC_TYPES=["aadhaar","driving_license","vehicle_rc","vehicle_photo","permit"];

  const getDocumentHealth=driver=>{
    const docs=driver?.driverProfile?.documents||[];
    const missing=REQUIRED_DOC_TYPES.filter(type=>{
      const doc=docs.find(d=>d.documentType===type&&d.documentUrl);
      return!doc;
    });
    const rejected=docs.filter(d=>d.verificationStatus==="rejected");
    const pending=docs.filter(d=>d.verificationStatus==="pending");
    const verified=docs.filter(d=>REQUIRED_DOC_TYPES.includes(d.documentType)&&d.verificationStatus==="verified");
    const allVerified=verified.length>=REQUIRED_DOC_TYPES.length&&missing.length===0&&rejected.length===0;
    return{missing,rejected,pending,verified,allVerified};
  };

  const getDriverStatus=driver=>{
    if(isDriverBlocked(driver)){
      return{label:"Blocked",className:"blocked"};
    }

    if(isDriverApproved(driver)){
      const health=getDocumentHealth(driver);
      if(!health.allVerified){
        return{
          label:health.rejected.length>0?"⚠ Docs Rejected":"⚠ Docs Pending",
          className:"waiting",
          warning:true
        };
      }
      return{label:"Approved",className:"approved"};
    }

    return{label:"Waiting",className:"waiting"};
  };

  const navigationItems=[
    {
      id:"dashboard",
      icon:"⌂",
      label:"Dashboard"
    },
    {
      id:"drivers",
      icon:"🚕",
      label:"Drivers",
      onClick:()=>openDriverSection("waiting")
    },
    {
      id:"bookings",
      icon:"▣",
      label:"Bookings"
    },
    {
      id:"warnings",
      icon:"⚠",
      label:"Warnings",
      onClick:()=>openDriverSection("warnings")
    },
    {
      id:"blocked",
      icon:"⊘",
      label:"Blocked Drivers",
      onClick:()=>openDriverSection("blocked")
    }
  ];

  const DOC_LABELS={
    driving_license:"Driving License",
    aadhaar:"Aadhaar Card",
    pan:"PAN Card",
    vehicle_rc:"Vehicle RC",
    insurance:"Insurance",
    pollution_certificate:"Pollution Certificate",
    permit:"Permit",
    fitness_certificate:"Fitness Certificate",
    profile_photo:"Profile Photo",
    vehicle_photo:"Vehicle Photo",
    other:"Other Document"
  };

  return(
    <div className="adminShell">

      {/* Document Viewer Modal */}
      {docDriver&&(
        <div style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,
          background:"rgba(0,0,0,0.85)",zIndex:9999,
          display:"flex",alignItems:"center",justifyContent:"center",
          padding:"20px"
        }}
          onClick={()=>{setDocDriver(null);setDocPreview(null);}}
        >
          <div style={{
            background:"#1a1a2e",border:"1px solid #f5c518",
            borderRadius:"16px",padding:"24px",maxWidth:"900px",
            width:"100%",maxHeight:"90vh",overflowY:"auto",
            color:"#fff"
          }}
            onClick={e=>e.stopPropagation()}
          >
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
              <div>
                <h3 style={{margin:0,color:"#f5c518"}}>📄 Documents — {docDriver?.driverProfile?.legalName||docDriver.name}</h3>
                <p style={{margin:"4px 0 0",color:"#999",fontSize:"13px"}}>{docDriver.phone}</p>
              </div>
              <button
                type="button"
                onClick={()=>{setDocDriver(null);setDocPreview(null);}}
                style={{background:"#333",border:"none",color:"#fff",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",fontSize:"16px"}}
              >✕ Close</button>
            </div>

            {/* Driver basic info */}
            <div style={{
              display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
              gap:"12px",marginBottom:"20px",
              background:"rgba(255,255,255,0.05)",borderRadius:"10px",padding:"14px"
            }}>
              <div><small style={{color:"#aaa"}}>License No.</small><br/><strong>{docDriver?.driverProfile?.licenseNumber||"N/A"}</strong></div>
              <div><small style={{color:"#aaa"}}>Vehicle</small><br/><strong>{docDriver?.driverProfile?.vehicle?.brand||""} {docDriver?.driverProfile?.vehicle?.model||""}</strong></div>
              <div><small style={{color:"#aaa"}}>Reg. Number</small><br/><strong>{docDriver?.driverProfile?.vehicle?.registrationNumber||"N/A"}</strong></div>
              <div><small style={{color:"#aaa"}}>Vehicle Type</small><br/><strong>{docDriver?.driverProfile?.vehicle?.vehicleType||"N/A"}</strong></div>
              <div><small style={{color:"#aaa"}}>Terms Accepted</small><br/><strong>{docDriver?.driverProfile?.termsAccepted?"✅ Yes":"❌ No"}</strong></div>
              <div><small style={{color:"#aaa"}}>Approval Status</small><br/><strong style={{color:docDriver?.driverProfile?.approvalStatus==="approved"?"#4ade80":docDriver?.driverProfile?.approvalStatus==="rejected"?"#f87171":"#fbbf24"}}>{docDriver?.driverProfile?.approvalStatus||"pending"}</strong></div>
            </div>

            {/* NEW: Legal Name Check by Admin */}
            <div style={{
              padding:"14px 16px",borderRadius:"12px",marginBottom:"14px",
              background:docDriver?.driverProfile?.legalNameVerified?"rgba(34,197,94,0.07)":"rgba(245,197,24,0.06)",
              border:`1px solid ${docDriver?.driverProfile?.legalNameVerified?"rgba(34,197,94,0.3)":"rgba(245,197,24,0.25)"}`
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                <div style={{color:"#f5c518",fontWeight:"700",fontSize:"12px",letterSpacing:"1px"}}>👤 LEGAL NAME (AS PER AADHAAR)</div>
                {docDriver?.driverProfile?.legalNameVerified
                  ?<span style={{fontSize:"12px",color:"#4ade80",fontWeight:"600"}}>🔒 Verified & Locked</span>
                  :<span style={{fontSize:"12px",color:"#f5c518",fontWeight:"600"}}>⚠ Not Verified</span>}
              </div>
              {nameEditMode?(
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  <input type="text" value={nameEditValue} onChange={e=>setNameEditValue(e.target.value)}
                    placeholder="Aadhaar card wala naam" autoFocus
                    style={{padding:"10px 12px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(245,197,24,0.4)",borderRadius:"8px",color:"#fff",fontSize:"15px",outline:"none"}}
                  />
                  <div style={{display:"flex",gap:"8px"}}>
                    <button type="button" disabled={nameBusy}
                      onClick={()=>updateDriverLegalName(docDriver,nameEditValue,true)}
                      style={{flex:2,padding:"8px",background:"#22c55e",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>
                      {nameBusy?"Saving...":"✅ Save & Lock Name"}
                    </button>
                    <button type="button" disabled={nameBusy}
                      onClick={()=>{setNameEditMode(false);setNameEditValue("");}}
                      style={{flex:1,padding:"8px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"8px",color:"#ccc",cursor:"pointer",fontSize:"13px"}}>
                      Cancel
                    </button>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <div style={{flex:1}}>
                    <div style={{color:docDriver?.driverProfile?.legalNameVerified?"#4ade80":"#fff",fontSize:"16px",fontWeight:"700"}}>
                      {docDriver?.driverProfile?.legalName||<span style={{color:"#888",fontStyle:"italic"}}>Driver ne naam nahi bhara</span>}
                    </div>
                    <div style={{color:docDriver?.driverProfile?.legalNameVerified?"#4ade80":"#888",fontSize:"11px",marginTop:"2px"}}>
                      {docDriver?.driverProfile?.legalNameVerified?"Verified — ab change nahi hoga":"Aadhaar se naam check karo → verify karke lock karo"}
                    </div>
                  </div>
                  {!docDriver?.driverProfile?.legalNameVerified&&(
                    <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                      <button type="button" disabled={nameBusy}
                        onClick={()=>{setNameEditValue(docDriver?.driverProfile?.legalName||"");setNameEditMode(true);}}
                        style={{padding:"7px 14px",background:"rgba(245,197,24,0.12)",border:"1px solid rgba(245,197,24,0.35)",borderRadius:"8px",color:"#f5c518",fontWeight:"700",cursor:"pointer",fontSize:"12px"}}>
                        ✏️ Edit
                      </button>
                      <button type="button" disabled={nameBusy||!docDriver?.driverProfile?.legalName}
                        onClick={()=>updateDriverLegalName(docDriver,docDriver?.driverProfile?.legalName,true)}
                        style={{padding:"7px 14px",background:"#22c55e",border:"none",borderRadius:"8px",color:"#fff",fontWeight:"700",cursor:"pointer",fontSize:"12px",opacity:!docDriver?.driverProfile?.legalName?0.5:1}}>
                        {nameBusy?"...":"✅ Name Correct"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Documents list */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"14px"}}>
              {(docDriver?.driverProfile?.documents||[]).length===0&&(
                <p style={{color:"#aaa",gridColumn:"1/-1"}}>⚠️ Koi document upload nahi kiya gaya hai.</p>
              )}
              {(docDriver?.driverProfile?.documents||[]).map((doc,i)=>(
                <div key={i} style={{
                  background:"rgba(255,255,255,0.06)",borderRadius:"10px",
                  padding:"12px",border:"1px solid rgba(255,255,255,0.1)"
                }}>
                  <div style={{fontSize:"12px",color:"#f5c518",marginBottom:"6px",fontWeight:"bold"}}>
                    {DOC_LABELS[doc.documentType]||doc.documentType}
                  </div>
                  {doc.documentNumber&&<div style={{fontSize:"11px",color:"#aaa",marginBottom:"4px"}}>No: {doc.documentNumber}</div>}
                  <div style={{
                    fontSize:"11px",marginBottom:"8px",
                    color:doc.verificationStatus==="verified"?"#4ade80":doc.verificationStatus==="rejected"?"#f87171":"#fbbf24"
                  }}>
                    ● {doc.verificationStatus||"pending"}
                  </div>
                  {doc.documentUrl?(
                    <button
                      type="button"
                      onClick={()=>viewDocument(docDriver,doc)}
                      style={{
                        background:"#f5c518",color:"#000",border:"none",
                        borderRadius:"6px",padding:"6px 12px",
                        fontSize:"12px",cursor:"pointer",fontWeight:"bold",width:"100%"
                      }}
                    >
                      {docLoading?"Loading...":"👁 View Document"}
                    </button>
                  ):(
                    <span style={{fontSize:"12px",color:"#888"}}>Not uploaded</span>
                  )}

                  {/* Approve / Reject buttons */}
                  {doc.documentUrl&&(
                    <div style={{display:"flex",gap:"6px",marginTop:"6px"}}>
                      <button
                        type="button"
                        disabled={!!docBusyId||doc.verificationStatus==="verified"}
                        onClick={()=>verifyDocument(docDriver,doc,"verify")}
                        style={{
                          flex:1,padding:"5px 0",fontSize:"11px",fontWeight:"bold",
                          background:doc.verificationStatus==="verified"?"rgba(34,197,94,0.2)":"#22c55e",
                          color:doc.verificationStatus==="verified"?"#4ade80":"#fff",
                          border:doc.verificationStatus==="verified"?"1px solid #4ade80":"none",
                          borderRadius:"6px",cursor:doc.verificationStatus==="verified"?"default":"pointer",
                          opacity:docBusyId===doc._id?0.6:1
                        }}
                      >
                        {doc.verificationStatus==="verified"?"✓ Verified":"✅ Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={!!docBusyId||doc.verificationStatus==="rejected"}
                        onClick={()=>verifyDocument(docDriver,doc,"reject")}
                        style={{
                          flex:1,padding:"5px 0",fontSize:"11px",fontWeight:"bold",
                          background:doc.verificationStatus==="rejected"?"rgba(239,68,68,0.2)":"#ef4444",
                          color:doc.verificationStatus==="rejected"?"#f87171":"#fff",
                          border:doc.verificationStatus==="rejected"?"1px solid #f87171":"none",
                          borderRadius:"6px",cursor:doc.verificationStatus==="rejected"?"default":"pointer",
                          opacity:docBusyId===doc._id?0.6:1
                        }}
                      >
                        {doc.verificationStatus==="rejected"?"✗ Rejected":"❌ Reject"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Approve/Reject from modal */}
            <div style={{display:"flex",gap:"12px",marginTop:"24px",justifyContent:"flex-end"}}>
              {!docDriver?.driverProfile?.isApproved&&!isDriverBlocked(docDriver)&&(
                <>
                  <button
                    type="button"
                    onClick={()=>{
                      approveDriver(docDriver);
                      setDocDriver(null);
                    }}
                    style={{
                      background:"#22c55e",color:"#fff",border:"none",
                      borderRadius:"8px",padding:"10px 24px",cursor:"pointer",fontWeight:"bold"
                    }}
                  >✅ Approve Driver</button>
                  <button
                    type="button"
                    onClick={()=>{
                      rejectDriver(docDriver);
                      setDocDriver(null);
                    }}
                    style={{
                      background:"#ef4444",color:"#fff",border:"none",
                      borderRadius:"8px",padding:"10px 24px",cursor:"pointer",fontWeight:"bold"
                    }}
                  >❌ Reject Driver</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Image Preview Modal */}
      {docPreview&&(
        <div style={{
          position:"fixed",top:0,left:0,right:0,bottom:0,
          background:"rgba(0,0,0,0.95)",zIndex:10000,
          display:"flex",alignItems:"center",justifyContent:"center"
        }}
          onClick={()=>{
            URL.revokeObjectURL(docPreview);
            setDocPreview(null);
          }}
        >
          <div style={{position:"relative",maxWidth:"90vw",maxHeight:"90vh"}}
            onClick={e=>e.stopPropagation()}
          >
            <button
              type="button"
              onClick={()=>{
                URL.revokeObjectURL(docPreview);
                setDocPreview(null);
              }}
              style={{
                position:"absolute",top:"-40px",right:0,
                background:"#333",border:"none",color:"#fff",
                borderRadius:"8px",padding:"6px 14px",cursor:"pointer"
              }}
            >✕ Close</button>
            {docPreviewType==="pdf"?(
              <iframe
                src={docPreview}
                style={{width:"80vw",height:"80vh",border:"none",borderRadius:"8px"}}
                title="Document Preview"
              />
            ):(
              <img
                src={docPreview}
                alt="Document"
                style={{maxWidth:"90vw",maxHeight:"85vh",borderRadius:"8px",objectFit:"contain"}}
              />
            )}
          </div>
        </div>
      )}
      <aside className="adminSidebar">
        <div className="adminBrand">
          <div className="adminBrandLogo">
            HG
          </div>

          <div>
            <small>
              HIMACHAL KI APNI RIDE
            </small>

            <strong>
              Admin Control
            </strong>
          </div>
        </div>

        <nav className="adminNavigation">
          {navigationItems.map(item=>(
            <button
              type="button"
              key={item.id}
              className={`adminNavItem ${
                activeSection===item.id||
                (item.id==="warnings"&&driverFilter==="warnings")||
                (item.id==="blocked"&&driverFilter==="blocked")
                  ?"active"
                  :""
              }`}
              onClick={()=>{
                if(item.onClick){
                  item.onClick();
                }else{
                  setActiveSection(item.id);
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="adminSidebarFooter">
          <div className="adminMiniProfile">
            <div>
              {user?.name?.charAt(0)?.toUpperCase()||"A"}
            </div>

            <span>
              <strong>
                {user?.name||"Admin"}
              </strong>

              <small>
                Super Admin
              </small>
            </span>
          </div>

          <button
            type="button"
            className="adminLogout"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="adminMain">
        <header className="adminTopbar">
          <div>
            <p>HIMRIDEG MANAGEMENT</p>

            <h1>
              {activeSection==="dashboard"&&"Admin Dashboard"}
              {activeSection==="drivers"&&"Driver Management"}
              {activeSection==="bookings"&&"Ride Management"}
            </h1>
          </div>

          <div className="adminTopActions">
            <button
              type="button"
              className="adminRefresh"
              onClick={refreshEverything}
            >
              ↻ Refresh data
            </button>

            <div className="adminProfileBadge">
              <span>
                {user?.name?.charAt(0)?.toUpperCase()||"A"}
              </span>

              <div>
                <strong>
                  {user?.name||"Admin"}
                </strong>

                <small>
                  Administrator
                </small>
              </div>
            </div>
          </div>
        </header>

        <main className="adminContent">
          {activeSection==="dashboard"&&(
            <>
              <section className="adminHero">
                <div>
                  <span>PLATFORM OVERVIEW</span>

                  <h2>
                    Namaste, {user?.name||"Admin"} 👋
                  </h2>

                  <p>
                    Drivers, bookings aur platform activity ko
                    ek hi jagah se manage karo.
                  </p>
                </div>

                <div className="adminHeroStatus">
                  <i />
                  System online
                </div>
              </section>

              <section className="adminStatsGrid">
                <StatCard
                  icon="👥"
                  label="Customers"
                  value={stats?.customers}
                />

                <StatCard
                  icon="🚕"
                  label="Waiting Drivers"
                  value={waitingDrivers.length}
                  onClick={()=>openDriverSection("waiting")}
                />

                <StatCard
                  icon="✓"
                  label="Approved"
                  value={approvedDrivers.length}
                  onClick={()=>openDriverSection("approved")}
                />

                <StatCard
                  icon="⊘"
                  label="Blocked"
                  value={blockedDrivers.length}
                  onClick={()=>openDriverSection("blocked")}
                />

                <StatCard
                  icon="▣"
                  label="Total Bookings"
                  value={stats?.bookings}
                  onClick={()=>setActiveSection("bookings")}
                />

                <StatCard
                  icon="⏳"
                  label="Pending Rides"
                  value={stats?.pendingBookings}
                />

                <StatCard
                  icon="🛣"
                  label="Active Rides"
                  value={stats?.activeBookings}
                />

                <StatCard
                  icon="🏁"
                  label="Completed"
                  value={stats?.completedBookings}
                />
              </section>

              <section className="adminDashboardGrid">
                <div className="adminPanel">
                  <div className="adminPanelHeading">
                    <div>
                      <span>DRIVER STATUS</span>
                      <h3>Waiting Drivers</h3>
                    </div>

                    <button
                      type="button"
                      onClick={()=>openDriverSection("waiting")}
                    >
                      View all
                    </button>
                  </div>

                  <div className="adminCompactList">
                    {waitingDrivers
                      .slice(0,5)
                      .map(driver=>{
                        const status=getDriverStatus(driver);

                        return(
                          <div
                            className="adminCompactRow"
                            key={driver._id}
                          >
                            <div className="adminDriverAvatar">
                              {driver.name?.charAt(0)?.toUpperCase()||"D"}
                            </div>

                            <div>
                              <strong>{driver.name}</strong>
                              <span>{getVehicleNumber(driver)}</span>
                            </div>

                            <em
                              className={`adminStatusBadge ${status.className}`}
                            >
                              {status.label}
                            </em>
                          </div>
                        );
                      })}

                    {waitingDrivers.length===0&&(
                      <p className="adminEmptyText">
                        No waiting drivers.
                      </p>
                    )}
                  </div>
                </div>

                <div className="adminPanel">
                  <div className="adminPanelHeading">
                    <div>
                      <span>RIDE ACTIVITY</span>
                      <h3>Latest Bookings</h3>
                    </div>

                    <button
                      type="button"
                      onClick={()=>setActiveSection("bookings")}
                    >
                      View all
                    </button>
                  </div>

                  <div className="adminCompactList">
                    {bookings.slice(0,5).map(ride=>(
                      <div
                        className="adminCompactRow booking"
                        key={ride._id}
                      >
                        <div className="adminDriverAvatar">
                          ↗
                        </div>

                        <div>
                          <strong>
                            {getLocationName(ride.pickup,"Pickup")}
                            {" → "}
                            {getLocationName(ride.dropoff,"Destination")}
                          </strong>

                          <span>
                            {ride.customer?.name||"Customer"}
                          </span>
                        </div>

                        <em
                          className={`adminRideBadge ${
                            ride.status||"pending"
                          }`}
                        >
                          {ride.status||"pending"}
                        </em>
                      </div>
                    ))}

                    {bookings.length===0&&(
                      <p className="adminEmptyText">
                        No bookings found.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {activeSection==="drivers"&&(
            <section className="adminPanel adminFullPanel">
              <div className="adminPanelHeading driverHeading">
                <div>
                  <span>DRIVER CONTROL</span>
                  <h3>Manage Drivers</h3>

                  <p>
                    Approve, warn, block aur unblock drivers.
                  </p>
                </div>

                <div className="adminDriverTools">
                  <input
                    type="search"
                    value={driverSearch}
                    placeholder="Search name, phone, vehicle..."
                    onChange={event=>
                      setDriverSearch(event.target.value)
                    }
                  />

                  <select
                    value={driverFilter}
                    onChange={event=>
                      setDriverFilter(event.target.value)
                    }
                  >
                    <option value="waiting">
                      Waiting approval
                    </option>

                    <option value="approved">
                      Approved drivers
                    </option>

                    <option value="all">
                      All drivers
                    </option>

                    <option value="blocked">
                      Blocked
                    </option>

                    <option value="warnings">
                      With warnings
                    </option>
                  </select>
                </div>
              </div>

              <div className="adminDriverGrid">
                {filteredDrivers.map(driver=>{
                  const status=getDriverStatus(driver);
                  const warnings=getDriverWarnings(driver);
                  const latestWarning=warnings[warnings.length-1];

                  const unblockPending=
                    driver?.unblockRequest?.status==="pending";

                  const isBusy=
                    busyDriverId===driver._id;

                  return(
                    <article
                      className="adminDriverCard"
                      key={driver._id}
                    >
                      <div className="adminDriverCardTop">
                        <div className="adminDriverIdentity">
                          <div className="adminLargeAvatar">
                            {driver.name?.charAt(0)?.toUpperCase()||"D"}
                          </div>

                          <div>
                            <h4>{driver.name}</h4>
                            <p>{driver.phone}</p>
                          </div>
                        </div>

                        <span
                          className={`adminStatusBadge ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="adminDriverMeta">
                        <div>
                          <span>Vehicle</span>
                          <strong>{getVehicleType(driver)}</strong>
                        </div>

                        <div>
                          <span>Number</span>
                          <strong>{getVehicleNumber(driver)}</strong>
                        </div>

                        <div>
                          <span>Warnings</span>
                          <strong>{warnings.length}</strong>
                        </div>

                        <div>
                          <span>Terms</span>

                          <strong>
                            {driver?.driverProfile?.termsAccepted||
                            driver?.termsAccepted
                              ?"Accepted"
                              :"Pending"}
                          </strong>
                        </div>
                      </div>

                      {isDriverBlocked(driver)&&(
                        <div className="adminAlertBox blocked">
                          <strong>Block reason</strong>
                          <p>
                            {driver.blockReason||
                              "Reason not available"}
                          </p>
                        </div>
                      )}

                      {/* Warning: approved but docs not verified */}
                      {isDriverApproved(driver)&&!isDriverBlocked(driver)&&(()=>{
                        const h=getDocumentHealth(driver);
                        if(h.allVerified)return null;
                        return(
                          <div style={{
                            padding:"10px 12px",borderRadius:"8px",
                            background:"rgba(249,115,22,0.1)",
                            border:"1px solid rgba(249,115,22,0.35)",
                            fontSize:"12px",color:"#fb923c",marginBottom:"4px"
                          }}>
                            <strong>⚠ Documents Verified Nahi Hain</strong>
                            {h.missing.length>0&&<p style={{margin:"4px 0 0",fontSize:"11px",color:"#aaa"}}>Missing: {h.missing.join(", ")}</p>}
                            {h.rejected.length>0&&<p style={{margin:"4px 0 0",fontSize:"11px",color:"#f87171"}}>Rejected: {h.rejected.map(d=>d.documentType).join(", ")}</p>}
                            {h.pending.length>0&&<p style={{margin:"4px 0 0",fontSize:"11px",color:"#f5c518"}}>Pending review: {h.pending.length} document(s)</p>}
                          </div>
                        );
                      })()}

                      {latestWarning&&(
                        <div className="adminAlertBox warning">
                          <strong>Latest warning</strong>
                          <p>{latestWarning.message}</p>

                          <small>
                            {latestWarning.acknowledged
                              ?"Acknowledged"
                              :"Not acknowledged"}
                          </small>
                        </div>
                      )}

                      {unblockPending&&(
                        <div className="adminAlertBox request">
                          <strong>Unblock request</strong>

                          <p>
                            {driver.unblockRequest?.message||
                              "Driver requested unblock"}
                          </p>
                        </div>
                      )}

                      <div className="adminDriverActions">
                        <button
                          type="button"
                          disabled={isBusy}
                          style={{
                            background:"#2563eb",color:"#fff",
                            border:"none",borderRadius:"8px",
                            padding:"8px 14px",cursor:"pointer",
                            fontWeight:"bold",fontSize:"13px"
                          }}
                          onClick={()=>setDocDriver(driver)}
                        >
                          {(()=>{
                            const docs=driver?.driverProfile?.documents||[];
                            const verified=docs.filter(d=>d.verificationStatus==="verified").length;
                            const total=docs.length;
                            if(total===0)return"📄 Documents";
                            return`📄 Documents (${verified}/${total} verified)`;
                          })()}
                        </button>

                        {!isDriverApproved(driver)&&
                        !isDriverBlocked(driver)&&(
                          <>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="approve"
                            onClick={()=>approveDriver(driver)}
                          >
                            {isBusy
                              ?"Approving..."
                              :"Approve"}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="reject"
                            onClick={()=>rejectDriver(driver)}
                          >
                            Reject
                          </button>
                          </>
                        )}

                        {/* Revoke if approved but docs not verified */}
                        {isDriverApproved(driver)&&!isDriverBlocked(driver)&&!getDocumentHealth(driver).allVerified&&(
                          <button
                            type="button"
                            disabled={isBusy}
                            style={{background:"#f97316",color:"#fff",border:"none",borderRadius:"8px",padding:"8px 14px",cursor:"pointer",fontWeight:"bold",fontSize:"13px"}}
                            onClick={()=>runDriverAction({
                              driver,
                              endpoint:"reject",
                              body:{reason:"Documents verify nahi hain — approval revoke kiya gaya."},
                              successMessage:"Approval revoke ho gaya"
                            })}
                          >
                            ⚠ Revoke Approval
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          className="warning"
                          onClick={()=>warnDriver(driver)}
                        >
                          Send Warning
                        </button>

                        {!isDriverBlocked(driver)?(
                          <button
                            type="button"
                            disabled={isBusy}
                            className="block"
                            onClick={()=>blockDriver(driver)}
                          >
                            Block
                          </button>
                        ):(
                          <button
                            type="button"
                            disabled={isBusy}
                            className="unblock"
                            onClick={()=>unblockDriver(driver)}
                          >
                            Unblock
                          </button>
                        )}

                        {unblockPending&&(
                          <button
                            type="button"
                            disabled={isBusy}
                            className="reject"
                            onClick={()=>
                              rejectUnblockRequest(driver)
                            }
                          >
                            Reject Request
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredDrivers.length===0&&(
                <div className="adminEmptyState">
                  <div>🚕</div>

                  <h3>
                    {driverFilter==="waiting"
                      ?"No drivers waiting for approval"
                      :"No matching drivers"}
                  </h3>

                  <p>
                    {driverFilter==="waiting"
                      ?"Sabhi drivers approve ho chuke hain."
                      :"Search ya filter change karke dobara dekho."}
                  </p>
                </div>
              )}
            </section>
          )}

          {activeSection==="bookings"&&(
            <section className="adminPanel adminFullPanel">
              <div className="adminPanelHeading bookingHeading">
                <div>
                  <span>RIDE MANAGEMENT</span>
                  <h3>All Bookings</h3>

                  <p>
                    Booking status aur assigned users dekho.
                  </p>
                </div>

                <div className="adminBookingFilters">
                  {bookingTabs.map(tab=>(
                    <button
                      type="button"
                      key={tab}
                      className={
                        bookingFilter===tab
                          ?"active"
                          :""
                      }
                      onClick={()=>setBookingFilter(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="adminBookingsTable">
                <div className="adminTableHeader">
                  <span>Route</span>
                  <span>Customer</span>
                  <span>Driver</span>
                  <span>Fare</span>
                  <span>Status</span>
                </div>

                {filteredBookings.map(ride=>(
                  <article
                    className="adminBookingRow"
                    key={ride._id}
                  >
                    <div>
                      <strong>
                        {getLocationName(ride.pickup,"Pickup")}
                        {" → "}
                        {getLocationName(ride.dropoff,"Destination")}
                      </strong>

                      <small>
                        {ride.travelDate
                          ?new Date(
                            ride.travelDate
                          ).toLocaleString("en-IN")
                          :"Date unavailable"}
                      </small>
                    </div>

                    <span>
                      {ride.customer?.name||"Unknown"}

                      <small>
                        {ride.customer?.phone||
                          ride.customerPhone||
                          ""}
                      </small>
                    </span>

                    <span>
                      {ride.driver?.name||"Not assigned"}

                      <small>
                        {ride.driver?.driverProfile?.vehicle
                          ?.registrationNumber||
                          ride.driver?.vehicleNumber||
                          ""}
                      </small>
                    </span>

                    <strong>
                      ₹{getRideFare(ride)}
                    </strong>

                    <div>
                      <em
                        className={`adminRideBadge ${
                          ride.status||"pending"
                        }`}
                      >
                        {ride.status||"pending"}
                      </em>

                      <button
                        type="button"
                        onClick={()=>
                          setOpenBookingId(
                            openBookingId===ride._id
                              ?""
                              :ride._id
                          )
                        }
                        style={{
                          display:"block",
                          marginTop:"8px",
                          cursor:"pointer"
                        }}
                      >
                        {openBookingId===ride._id
                          ?"Hide Details"
                          :"Full Details"}
                      </button>
                    </div>

                    {openBookingId===ride._id&&(
                      <div
                        style={{
                          gridColumn:"1 / -1",
                          display:"grid",
                          gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
                          gap:"14px",
                          width:"100%",
                          padding:"16px",
                          marginTop:"10px",
                          borderRadius:"14px",
                          background:"rgba(255,255,255,0.04)"
                        }}
                      >
                        <div>
                          <strong>
                            Customer Details
                          </strong>

                          <p>
                            Name: {ride.customer?.name||"Unknown"}
                          </p>

                          <p>
                            Phone: {ride.customer?.phone||ride.customerPhone||"Not available"}
                          </p>

                          <p>
                            Alternative Phone: {ride.customer?.alternativePhone||"Not available"}
                          </p>

                          <p>
                            Email: {ride.customer?.email||"Not available"}
                          </p>

                          <p>
                            Account: {ride.customer?.accountStatus||"active"}
                          </p>
                        </div>

                        <div>
                          <strong>
                            Driver Details
                          </strong>

                          <p>
                            Name: {ride.driver?.name||"Not assigned"}
                          </p>

                          <p>
                            Phone: {ride.driver?.phone||"Not available"}
                          </p>

                          <p>
                            Alternative Phone: {ride.driver?.alternativePhone||"Not available"}
                          </p>

                          <p>
                            Email: {ride.driver?.email||"Not available"}
                          </p>

                          <p>
                            Online: {ride.driver?.isOnline?"Yes":"No"}
                          </p>

                          <p>
                            Available: {ride.driver?.isAvailable?"Yes":"No"}
                          </p>

                          <p>
                            Vehicle: {ride.driver?getVehicleType(ride.driver):"Not assigned"}
                          </p>

                          <p>
                            Vehicle No.: {ride.driver?getVehicleNumber(ride.driver):"Not assigned"}
                          </p>
                        </div>

                        <div>
                          <strong>
                            Ride Details
                          </strong>

                          <p>
                            Booking ID: {ride._id}
                          </p>

                          <p>
                            Pickup: {getLocationName(ride.pickup,"Pickup")}
                          </p>

                          <p>
                            Drop: {getLocationName(ride.dropoff,"Destination")}
                          </p>

                          <p>
                            Passengers: {ride.passengers||ride.passengerCount||1}
                          </p>

                          <p>
                            Status: {ride.status||"pending"}
                          </p>

                          <p>
                            Fare: ₹{getRideFare(ride)}
                          </p>

                          <p>
                            Date: {ride.travelDate?new Date(ride.travelDate).toLocaleString("en-IN"):"Date unavailable"}
                          </p>

                          <p>
                            Note: {ride.note||ride.customerNote||"No note"}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                ))}

                {filteredBookings.length===0&&(
                  <div className="adminEmptyState">
                    <div>▣</div>
                    <h3>No bookings found</h3>

                    <p>
                      Is filter me koi booking available nahi hai.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  onClick
}){
  const Tag=onClick?"button":"article";

  return(
    <Tag
      type={onClick?"button":undefined}
      className="adminStatCard"
      onClick={onClick}
    >
      <div>{icon}</div>

      <span>
        <small>{label}</small>
        <strong>{value??0}</strong>
      </span>
    </Tag>
  );
}

export default AdminDashboard;