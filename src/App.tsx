/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Organization } from "./types";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";

// Modules
import HomeModule from "./components/HomeModule";
import AnalyticsModule from "./components/AnalyticsModule";
import CRMModule from "./components/CRMModule";
import UploadContactsModule from "./components/UploadContactsModule";
import CampaignModule from "./components/CampaignModule";
import SandboxModule from "./components/SandboxModule";
import AIChatbotModule from "./components/AIChatbotModule";
import WorkflowModule from "./components/WorkflowModule";
import SupportModule from "./components/SupportModule";
import PrivacyModule from "./components/PrivacyModule";
import TeamModule from "./components/TeamModule";
import SettingsModule from "./components/SettingsModule";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orgSettings, setOrgSettings] = useState<Organization | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash) {
      return hash.replace("#", "");
    }
    // Default fallback to login
    return "/login";
  });

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          // Load active organization details
          const orgRes = await fetch("/api/organization/settings");
          const orgData = await orgRes.json();
          setOrgSettings(orgData.organization || null);

          // Redirect to operations dashboard instead of login
          if (currentPath === "/login" || currentPath === "" || currentPath === "/") {
            handleNavigate("/dashboard");
          }
        } else {
          setCurrentUser(null);
          handleNavigate("/login");
        }
      }
    } catch (e) {
      console.warn("Could not retrieve server auth state, fallback to guest.", e);
      handleNavigate("/login");
    }
  };

  useEffect(() => {
    checkSession();

    // Listen for hash modifications (back-navigation)
    const handleHashChange = () => {
      const newHashPath = window.location.hash.replace("#", "") || "/login";
      setCurrentPath(newHashPath);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Redirect to Operations Dashboard after successful authentication
    handleNavigate("/dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setCurrentUser(null);
      handleNavigate("/login");
    }
  };

  // Switch workspace content dynamically based on currentPath route URI
  const renderModule = () => {
    if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} />;

    switch (currentPath) {
      case "/dashboard":
        return <HomeModule user={currentUser} onNavigate={handleNavigate} />;
      case "/dashboard/analytics":
        return <AnalyticsModule user={currentUser} onNavigate={handleNavigate} />;
      case "/dashboard/upload-contacts":
        return <UploadContactsModule user={currentUser} />;
      case "/dashboard/crm":
        return <CRMModule user={currentUser} />;
      case "/dashboard/campaigns":
        return <CampaignModule user={currentUser} />;
      case "/dashboard/sandbox":
        return <SandboxModule user={currentUser} />;
      case "/dashboard/ai-center":
        return <AIChatbotModule user={currentUser} />;
      case "/dashboard/workflows":
        return <WorkflowModule user={currentUser} />;
      case "/dashboard/tickets":
        return <SupportModule user={currentUser} />;
      case "/dashboard/privacy":
        return <PrivacyModule user={currentUser} />;
      case "/dashboard/team":
        return <TeamModule user={currentUser} />;
      case "/dashboard/settings":
        return <SettingsModule user={currentUser} />;
      default:
        // Default first screen page redirect is operations metrics dashboard
        return <AnalyticsModule user={currentUser} onNavigate={handleNavigate} />;
    }
  };

  // If user is at /login, display full-screen login container
  const isLoginPage = !currentUser || currentPath === "/login";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex selection:bg-indigo-600/30 selection:text-white">
      {isLoginPage ? (
        <div className="flex-grow flex items-center justify-center p-4 bg-[#09090b]">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <div className="flex w-full h-screen overflow-hidden">
          {/* Main Workspace Navigation Drawer */}
          <Sidebar 
            user={currentUser} 
            activeRoute={currentPath} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout} 
          />

          {/* Module Canvas Body */}
          <main className="flex-1 overflow-hidden relative bg-[#09090b]">
            {renderModule()}
          </main>
        </div>
      )}
    </div>
  );
}
