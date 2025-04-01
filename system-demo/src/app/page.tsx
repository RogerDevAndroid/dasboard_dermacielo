import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://mkmrhuckumpnfhcwowfq.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXJodWNrdW1wbmZoY3dvd2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NjI2MTAsImV4cCI6MjA1OTAzODYxMH0.VXjTukYimBCd0vYCy1eyOvCXWoDzO8Sx3pCZmqhGyKQ'; // Replace with your Supabase public API key
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import DemoSection from "@/components/DemoSection";
import WebSearchDemo from "@/components/demos/WebSearchDemo";
import WebScrapeDemo from "@/components/demos/WebScrapeDemo";
import TerminalDemo from "@/components/demos/TerminalDemo";
import FileSystemDemo from "@/components/demos/FileSystemDemo";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">System Demo</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center mb-12">
        This page showcases various components and system capabilities
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>UI Components</CardTitle>
            <CardDescription>
              Explore the shadcn/ui components available in this system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buttons" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="buttons">Buttons</TabsTrigger>
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="accordion">Accordion</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>
              <TabsContent value="buttons" className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </TabsContent>
              <TabsContent value="inputs" className="space-y-4 pt-4">
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" placeholder="Email" />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" placeholder="Password" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Airplane Mode</Label>
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea placeholder="Type your message here." id="message" />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="framework">Framework</Label>
                    <Select>
                      <SelectTrigger id="framework">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="next">Next.js</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="accordion" className="pt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It adheres to the WAI-ARIA design pattern.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it styled?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It comes with default styles that matches the other
                      components&apos; aesthetic.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Is it animated?</AccordionTrigger>
                    <AccordionContent>
                      Yes. It&apos;s animated by default, but you can disable it if
                      you prefer.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              <TabsContent value="cards" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create project</CardTitle>
                      <CardDescription>
                        Deploy your new project in one-click.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form>
                        <div className="grid w-full items-center gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Name of your project" />
                          </div>
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Cancel</Button>
                      <Button>Deploy</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Capabilities</CardTitle>
            <CardDescription>
              Overview of various system functionalities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tools-1">
                <AccordionTrigger>Web Interaction</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Web search for text and images</li>
                    <li>Web scrape to capture site design and content</li>
                    <li>Deploy to Netlify (static or dynamic sites)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tools-2">
                <AccordionTrigger>File System Operations</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>List directory contents</li>
                    <li>Search files by name (fuzzy search)</li>
                    <li>Search file contents (grep search)</li>
                    <li>Read file contents</li>
                    <li>Edit files or create new ones</li>
                    <li>Delete files</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tools-3">
                <AccordionTrigger>Terminal Commands</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Run any terminal command</li>
                    <li>Start development servers</li>
                    <li>Install packages (preferably with Bun)</li>
                    <li>Execute build commands</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="tools-4">
                <AccordionTrigger>Project Management</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Version control via versioning tool</li>
                    <li>Next step suggestions</li>
                    <li>Project deployment</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <DemoSection title="System Tool Demos" description="Interactive demonstrations of system capabilities" />

      <div className="grid grid-cols-1 gap-8 mt-10">
        <Card id="coming-soon">
          <CardHeader>
            <CardTitle className="text-center">Interactive Demos Coming Soon</CardTitle>
            <CardDescription className="text-center">
              We'll implement interactive demos for web search, web scraping,
              terminal commands, and file system operations in the next version
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button>Check Back Later</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
