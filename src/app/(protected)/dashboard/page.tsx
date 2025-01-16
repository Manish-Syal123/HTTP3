"use client";
import React, { useEffect, useState } from "react";
import {
  Globe,
  Shield,
  Zap,
  Activity,
  DollarSign,
  Users,
  Clock,
  Loader2,
  Layout,
  Rocket,
  GitBranch,
  Cpu,
  Network,
  Search,
} from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePrivy } from "@privy-io/react-auth";
import {
  createWebpageWithName,
  getUserIdByEmail,
  getUserWebpages,
  initializeClients,
} from "@/utils/db/actions";
import DeploymentVisual from "@/components/DeploymentVisual";

type Webpage = {
  webpages: {
    id: number;
    domain: string;
    cid: string;
    name: string | null;
  };
  deployments: {
    id: number;
    deploymentUrl: string;
    deployedAt: Date | null;
    transactionHash: string;
  } | null;
};

const Dashboard = () => {
  const sidebarItems = [
    { name: "Sites", icon: Layout },
    { name: "Deploy", icon: Rocket },
    { name: "Manage Websites", icon: GitBranch },
    { name: "Tokens", icon: Zap },
    { name: "AI Website", icon: Cpu },
    { name: "Decentralized CDN", icon: Network },
    { name: "Search Engine", icon: Search },
    { name: "Example Websites", icon: Globe },
    { name: "Smart Contracts", icon: Shield },
  ];
  const { user, authenticated } = usePrivy();
  const [code, setCode] = useState(``);
  const [activeTab, setActiveTab] = React.useState("Sites");
  const [domain, setDomain] = useState("");
  const [deployedUrl, setDeployedUrl] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [livePreview, setLivePreview] = useState(code);
  const [userId, setUserId] = useState<number | null>(null);
  const [w3name, setW3name] = useState<string | null>(null);
  const [userWebpages, setUserWebpages] = useState<Webpage[]>([]);
  const [content, setContent] = useState("");
  const [deploymentError, setDeploymentError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedWebpage, setSelectedWebpage] = React.useState<Webpage | null>(
    null
  );

  useEffect(() => {
    // Update live preview when code changes
    setLivePreview(code);
  }, [code]);

  useEffect(() => {
    async function init() {
      if (authenticated && user?.email?.address) {
        try {
          console.log(user);

          await initializeClients(user.email.address);
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to initialize clients:", error);
          setDeploymentError("");
        }
      }
    }

    init();
  }, [authenticated, user]);

  useEffect(() => {
    async function fetchUserId() {
      if (authenticated && user?.email?.address) {
        const fetchedUserId = await getUserIdByEmail(user?.email?.address);
        console.log(fetchUserId);
        console.log(user.email.address);
        setUserId(fetchedUserId);
      }
    }

    fetchUserId();
  }, [authenticated, user]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentError("");

    try {
      //1. check if we have web3storage client initiallized
      if (!isInitialized) {
        throw new Error("Clients not initialized");
      }
      //2.  check if user id exists
      if (userId === null) {
        throw new Error("User not authenticated or ID not found");
      }
      //3. createwebpagewithname
      const { webpage, txHash, cid, deploymentUrl, name, w3nameUrl } =
        await createWebpageWithName(userId, domain, content);
      //4. update deployed url
      setDeployedUrl(w3nameUrl || deploymentUrl);
      //5. setweb3name
      setW3name(name);
      console.log(
        `Deployed successfully. Transaction hash: ${txHash}, CID: ${cid}, URL: ${
          w3nameUrl || deploymentUrl
        }, W3name: ${name}`
      );
      //6. update users webpages or refresh user webpages
      const updatedWebpages = await getUserWebpages(userId);
      setUserWebpages(updatedWebpages as Webpage[]);
    } catch (error) {
      console.error("Deployment failed:", error);
      setDeploymentError("Deployment failed. Please try again.");
    } finally {
      setIsDeploying(false);
    }
  };

  //handle Update
  const handleUpdate = async () => {};
  return (
    <div className="min-h-screen bg-[#242839] text-gray-300">
      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          items={sidebarItems}
          activeItem={activeTab}
          setActiveItem={setActiveTab}
        />
        <div className="flex-1 p-10 ml-64">
          <h1 className="text-4xl font-bold mb-8 text-white">
            Welcome to Your Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#3f465f] border-[#525c7c]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Websites
                </CardTitle>
                <Globe className="h-4 w-4 text-gray-00" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userWebpages?.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#3f465f] border-[#525c7c]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Latest Deployment
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userWebpages.length > 0
                    ? new Date(
                        Math.max(
                          ...userWebpages
                            .filter((w) => w.deployments?.deployedAt)
                            .map((w) => w.deployments!.deployedAt!.getTime())
                        )
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#3f465f] border-[#525c7c]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  Total Deployments
                </CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {userWebpages.filter((w) => w.deployments).length}
                </div>
              </CardContent>
            </Card>
          </div>
          {activeTab === "Sites" && <p>Sites</p>}
          {activeTab === "Deploy" && (
            <>
              <Card className="bg-[#3f465f] border-[#525c7c]">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    {selectedWebpage ? "Edit Website" : "Deploy a New Website"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="domain" className="text-lg text-gray-400">
                        Domain
                      </Label>
                      <Input
                        id="domain"
                        placeholder="Enter your domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="mt-1 bg-[#212333] text-white border-gray-700"
                        disabled={!!selectedWebpage}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="content"
                        className="text-lg text-gray-400"
                      >
                        Content
                      </Label>
                      <Textarea
                        id="content"
                        placeholder="Enter your HTML content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="mt-1 min-h-[200px] font-mono text-sm bg-[#212333] text-white border-gray-700"
                      />
                    </div>
                    <Button
                      // onClick={selectedWebpage ? handleUpdate : handleDeploy}
                      onClick={handleDeploy}
                      // disabled={
                      //   isDeploying ||
                      //   !domain ||
                      //   !content ||
                      //   !isInitialized ||
                      //   userId === null
                      // }
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      {selectedWebpage ? "Update Website" : "Deploy to HTTP3"}
                      {isDeploying && (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {selectedWebpage ? "Updating..." : "Deploying..."}
                        </>
                      )}
                    </Button>
                    {deploymentError && (
                      <p className="text-red-400 mt-2">{deploymentError}</p>
                    )}
                    {deployedUrl && (
                      <DeploymentVisual deployedUrl={deployedUrl} />
                    )}
                  </div>
                </CardContent>
              </Card>

              {content && (
                <Card className="mt-4 bg-[#0a0a0a] border-[#18181b]">
                  <CardHeader>
                    <CardTitle className="text-white">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border border-[#18181b] p-4 rounded-lg">
                      <iframe
                        srcDoc={content}
                        style={{
                          width: "100%",
                          height: "400px",
                          border: "none",
                        }}
                        title="Website Preview"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
