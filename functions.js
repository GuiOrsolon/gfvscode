"use strict"
const vscode = require('vscode');
const pr     = require('properties-reader');
const path   = require('path');
const cp     = require('child_process');
const fs     = require('fs');
const os     = require('os');

//Import constants of extension

const cts    = require('./constants');

//VSCode Interface Components

let grailsChannel    = vscode.window.createOutputChannel(`Grails`);
let statusBarItem    = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
let stbarConfig      = [];

//Global Variables

let applicationName  = '';
let grailsVersion    = '';
let grailsCommand    = '';
let isAPluginGrails  = '';

//Filters and Catchers

let outputFilter     = '';
let infoCatcher      = '';
let createCatcher    = '';
let urlCatcher       = '';
let stopCatcher      = '';

//Configuration Variables

let nameProxy        = '';
let hostProxy        = '';
let portProxy        = '';
let usernameProxy    = '';
let passwordProxy    = '';
let proxyCommand     = '';

//Utility functions

function showGrailsChannel() {
  grailsChannel.show();
}

function getWorkspaceDir(){
  try{
    let result = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath);
    return result;
  }catch(err){
    return null;
  }
}

function checkIfIsAGrailsProject(){
  if(getWorkspaceDir() != null){
    if(fs.existsSync(path.join(getWorkspaceDir(),'grails-app')))
      return true;
    else
      return false;
  }else{
    return null;
  }
}

function checkIfIsAGrailsPlugin(){
  let properties  = pr(path.join(getWorkspaceDir(),'application.properties'));
  grailsVersion   = properties.get("app.grails.version");
  applicationName = properties.get("app.name");
  if(getWorkspaceDir() != null){
    if(fs.existsSync(path.join(getWorkspaceDir(),`${applicationName}GrailsPlugin.groovy`))){
      vscode.window.showInformationMessage(`Grails Plugin Project Detected`);
      isAPluginGrails = 'yes';
    }
  }
}

function defineAppProperties(){
  let properties  = pr(path.join(getWorkspaceDir(),'application.properties'));
  grailsVersion   = properties.get("app.grails.version");
  applicationName = properties.get("app.name");
  vscode.window.showInformationMessage(`Grails Version detected: ${grailsVersion}`);
}

function getGrailsVersion(){
  return grailsVersion;
}

function setStatusBarItem(status){
  if(status != 'dispose'){
    if     (status == 'create')   stbarConfig = ['Creating Grails App...','#ffffff'];
    else if(status == 'done')     stbarConfig = ['Grails Done...', '#ffffff'];
    else if(status == 'init')     stbarConfig = ['Performing Grails Application Init...','#ffffff'];
    else if(status == 'running')  stbarConfig = ['Grails Application Running...','#3bad3d'];
    else if(status == 'stopping') stbarConfig = ['Stopping Application...','#bd2438'];
    else if(status == 'stopped')  stbarConfig = ['Grails Application Stopped...','#ffffff'];
    statusBarItem.text  = stbarConfig[0];
    statusBarItem.color = stbarConfig[1];
    statusBarItem.show();
  }else{
    statusBarItem.hide();
  }
}

function getFileListFolder(typeFiles){
  let directory = '';
  let fileList = [];
  directory = path.join(getWorkspaceDir(),`grails-app/${typeFiles}/${applicationName}`);
  fs.readdir(directory, (err, files) =>{
    files.forEach(file =>{
      fileList.append(file.match(/[^.groovy\n]+/gi));
    });
  });
  return fileList;
}

function filterVersion(version, resource){
  let result;
  if(resource == 'create-filter'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'create-interceptor'){
    if(parseInt(version[0] > 3)){
      result = true;
    }else{
      result = false;
    }
  }else if(resource == 'add-proxy'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'clear-proxy'){
    if(parseInt(version[0]) > 3){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'remove-proxy'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'set-proxy'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'generate-doc'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'migrate-docs'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }else if(resource == 'create-pom'){
    if(parseInt(version[0] > 3)){
      result = false;
    }else{
      result = true;
    }
  }
  return result;
}

//Development functions

function runApp(){
  defineAppProperties();
  setStatusBarItem('init');
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    vscode.window.showInformationMessage(`Running App '${applicationName}'...`);
    let result = cp.exec(`grails run-app`, {cwd: getWorkspaceDir()});
    result.stdout.on("data", (data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      urlCatcher   = outputFilter.match(/(http|https)?:\/\/.+/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
        if(urlCatcher != null){
          setStatusBarItem('running');
          vscode.env.openExternal(vscode.Uri.parse(urlCatcher[0]));
        }
      }
      resolve();
    });
  });
  return promise;
}

function stopApp(){
  defineAppProperties();
  setStatusBarItem('stopping');
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    vscode.window.showInformationMessage(`Stopping App '${applicationName}'...`);
    let result = cp.exec(`grails stop-app`, {cwd: getWorkspaceDir()});
    result.stdout.on("data", (data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      stopCatcher  = outputFilter.match(/Server Stopped/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
        if(stopCatcher != null){
          setStatusBarItem('stopped');
          vscode.window.showInformationMessage(`Grails Application '${applicationName}' was stopped.`);
        }
      }
      resolve();
    });
  });
  return promise;
}

async function grailsRunCommand(){
  grailsCommand = await vscode.window.showInputBox(cts.optInputGrailsCommand);
  if(grailsCommand != null && grailsCommand.length > 0){
    grailsChannel.show();
    let promise = new Promise(resolve => {
      let result = cp.exec(`grails ${grailsCommand}`, {cwd: getWorkspaceDir()});
      result.stdout.on("data", (data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
      });
      resolve();
    });
    return promise;
  }
}

function cleanProject(){
  vscode.window.showInformationMessage(`Performing Project Cleaning...`);
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    let result = cp.exec(`grails clean`, {cwd: getWorkspaceDir()});
    result.stdout.on("data", (data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
      }
    });
    resolve();
  });
  return promise;
}

function compileProject(){
  vscode.window.showInformationMessage(`Performing Project Compile...`);
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    let result = cp.exec(`grails compile`,{cwd: getWorkspaceDir()});
    result.stdout.on("data",(data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
      }
    });
    resolve();
  });
  return promise;
}

async function showDependencyReport(){
  await vscode.window.showInformationMessage(`Show Grails Dependency Report in Terminal or Save a Text File?`,'Terminal','Text File').then(selection =>{
    if(selection === 'Terminal'){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails dependency-report`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          grailsChannel.append(`${data}\n`);
          resolve();
        });
        result.stdout.on("end", () =>{
          grailsChannel.append(`Done!`);
        });
      });
      return promise;
    }else{
      grailsChannel.show();
      grailsChannel.append(`Generating Text File of Grails Dependency Report...`);
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails dependency-report > dependency-report.txt`,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          grailsChannel.append(`${data}`);
          resolve();
        });
        result.stdout.on("end", ()=>{
          grailsChannel.append(`Done!`);
        });
      });
      return promise;
    }
  });
}

async function showHelp(){
  await vscode.window.showInformationMessage(`Show Grails Help in Terminal or Save a Text File?`,'Terminal','Text File').then(selection =>{
    if(selection === 'Terminal'){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails help`, {cwd:getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          grailsChannel.append(`${data}\n`);
          resolve();
        });
        result.stdout.on("end", ()=>{
          grailsChannel.appendLine(`Done!`);
        });
      });
      return promise;
    }else{
      grailsChannel.show();
      grailsChannel.append(`Generating Text File of Grails Help...`);
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails help > grails-help.txt`,{cwd:getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          grailsChannel.append(`${data}`);
          resolve();
        });
        result.stdout.on("end", ()=>{
          grailsChannel.append(`Done!`);
        });
      });
      return promise;
    }
  });
}

async function listPlugins(){
  await vscode.window.showInformationMessage(`Show Grails List Plugins in Terminal or Save a Text File?`,'Terminal','Text File').then(selection =>{
    if(selection === 'Terminal'){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails list-plugins`,{cwd:getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          grailsChannel.append(`${data}\n`);
          resolve();
        });
        result.stdout.on("end",()=>{
          grailsChannel.appendLine(`Done!`);
        });
      });
      return promise;
    }else{
      grailsChannel.show();
      grailsChannel.append(`Generating Text File of Grails List Plugins...`);
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails list-plugins > grails-list-plugins.txt`,{cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          grailsChannel.append(`${data}`);
          resolve();
        })
        result.stdout.on("end", ()=>{
          grailsChannel.append(`Done!`);
        });
      });
      return promise;
    }
  });
}

function showConsole(){
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    let result = cp.exec(`grails console`, {cwd: getWorkspaceDir()});
    result.stdout.on("data",(data)=>{
      grailsChannel.append(`${data}`);
      resolve();
    });
    result.stdout.on("end", ()=>{
      grailsChannel.appendLine(`Done!`);
    });
  });
  return promise;
}

async function showStats(){
  await vscode.window.showInformationMessage(`Show Grails Stats in Terminal or Save a Text File?`,'Terminal','Text File').then(selection =>{
    if(selection === 'Terminal'){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails stats`, {cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          grailsChannel.append(`${data}`);
          resolve();
        });
        result.stdout.on("end", ()=>{
          grailsChannel.appendLine(`Done!`);
        })
      });
      return promise;
    }else{
      grailsChannel.show();
      grailsChannel.append(`Generating Text File of Grails Stats...`);
      let promise = new Promise(resolve =>{
        let result = cp.exec(`grails stats > grails-stats.txt`,{cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          grailsChannel.append(`${data}`);
          resolve();
        });
        result.stdout.on("end", ()=>{
          grailsChannel.append(`Done!`);
        });
      });
      return promise;
    }
  });
}

function generateDoc(){
  let command = '';
  if(filterVersion(getGrailsVersion(),'generate-doc')){
    command = `grails doc`;
  }else{
    command = `grails docs`;
  }
  vscode.window.showInformationMessage(`Generating documentation os project...`);
  grailsChannel.show();
  let promise = new Promise(resolve => {
    let result = cp.exec(`${command}`, {cwd: getWorkspaceDir()});
    result.stdout.on("data",(data)=>{
      grailsChannel.append(`${data}`);
    });
    result.stdout.on("end", ()=>{
      grailsChannel.append(`Done!`);
    });
    resolve();
  });
  return promise;
}

function createWar(){
  vscode.window.showInformationMessage(`Generating WAR of Project...`);
  grailsChannel.show();
  let promise = new Promise(resolve =>{
    let result = cp.exec(`grails war`,{cwd: getWorkspaceDir()});
    result.stdout.on("data",(data)=>{
      outputFilter = data;
      infoCatcher  = outputFilter.match(/\w.+/gi);
      if(infoCatcher != null){
        grailsChannel.append(`${infoCatcher[0]}\n`);
      }
    });
    result.stdout.on("end", ()=>{
      grailsChannel.append(`Done!`);
    });
    resolve();
  });
  return promise;
}

function packagePlugin(){
  if(isAPluginGrails != 'yes'){
    vscode.window.showErrorMessage(`Unable to create a package if the project is not a Grails Plugin!`);
  }else{
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(`grails package-plugin`,{cwd: getWorkspaceDir()});
      result.stdout.on("data", (data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
        if(infoCatcher != null){
          grailsChannel.append(`${infoCatcher[0]}\n`);
        }
      });
      result.stdout.on("end",()=>{
        grailsChannel.append(`Done!`);
      });
      resolve();
    });
    return promise;
  }
}

function mavenInstall(){
  if(isAPluginGrails != 'yes'){
    vscode.window.showErrorMessage(`Unable to perform Maven Install if the project is not a Grails Plugin!`);
  }else{
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(`grails maven-install`, {cwd: getWorkspaceDir()});
      result.stdout.on("data",(data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
        if(infoCatcher != null){
          grailsChannel.append(`${infoCatcher[0]}\n`);
        }
      });
      result.stdout.on("end",()=>{
        grailsChannel.append(`Done!`);
      });
      resolve();
    });
    return promise;
  }
}

function migrateDocs(){
  if(!filterVersion(getGrailsVersion(),'migrate-docs')){
    vscode.window.showErrorMessage(`The 'migrate-docs' method is deprecated.`);
  }else{
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(`grails migrate-docs`,{cwd: getWorkspaceDir()});
      result.stdout.on("data",(data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
        if(infoCatcher != null){
          grailsChannel.append(`${infoCatcher[0]}\n`);
        }
      });
      result.stdout.on("end", ()=>{
        grailsChannel.append(`Done!`);
      });
      resolve()
    });
    return promise;
  }
}

//Configuration functions

async function addProxy(proxyWithUser){
  if(!filterVersion(getGrailsVersion(),'add-proxy')){
    vscode.window.showErrorMessage(`The 'add-proxy' method is deprecated.`);
  }else{
    nameProxy = await vscode.window.showInputBox(cts.optInputNameProxy);
    if (nameProxy != null && nameProxy.length > 0){
      hostProxy = await vscode.window.showInputBox(cts.optInputHostProxy);
      if(hostProxy != null && hostProxy.length > 0){
        portProxy = await vscode.window.showInputBox(cts.optInputPortProxy);
        if(portProxy != null && portProxy.length > 0){
          if(!isNaN(portProxy)){
            if(proxyWithUser){
              do
                usernameProxy = await vscode.window.showInputBox(cts.optInputUsernameProxy);
              while(usernameProxy == null && usernameProxy.length <= 0);
  
              do
                passwordProxy = await vscode.window.showInputBox(cts.optInputPasswordProxy);
              while(passwordProxy == null && passwordProxy.length <= 0);
            }
          }else{
            vscode.window.showErrorMessage(`The port of proxy configuration is not a number.`);
            return;
          }
        }else{
          vscode.window.showErrorMessage(`The port of proxy configuration required.`);
          return;
        }
      }else{
        vscode.window.showErrorMessage(`The hostname of proxy configuration required.`);
        return;
      }
    }else{
      vscode.window.showErrorMessage(`The name of proxy configuration required.`);
      return;
    }

    proxyCommand = `grails add-proxy ${nameProxy} --host=${hostProxy} --port=${portProxy}`;

    if(proxyWithUser){
      proxyCommand = proxyCommand.concat(` --username=${usernameProxy} --password=${passwordProxy}`);
    }

    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(proxyCommand, {cwd: getWorkspaceDir()});
      result.stdout.on("data",(data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
      });
      resolve();
    });
    return promise;
  }
}

function clearProxy(){
  if(!filterVersion(getGrailsVersion(),'clear-proxy')){
    vscode.window.showErrorMessage(`The 'clear-proxy' method is deprecated.`);
  }else{
    grailsChannel.show();
    let promise = new Promise(resolve =>{
      let result = cp.exec(`grails clear-proxy`,{cwd: getWorkspaceDir()});
      result.stdout.on("data", (data)=>{
        outputFilter = data;
        infoCatcher  = outputFilter.match(/\w.+/gi);
      });
      resolve();
    });
    return promise;
  }
}

async function removeProxy(){
  if(!filterVersion(getGrailsVersion(),'remove-proxy')){
    vscode.window.showErrorMessage(`The 'remove-proxy' method is deprecated.`);
  }else{
    let file = path.join(`${os.homedir()}/.grails`,'ProxySettings.groovy');
    let data = fs.readFileSync(file,'utf-8');
    let lines = data.split(/\r?\n/);
    let proxyNamesCatcher;
    let proxyNamesList = [];
    lines.forEach((line) =>{
      if(line.length > 0){
        proxyNamesCatcher = line.match(/(^\w+)/gi);
        proxyNamesList.push(proxyNamesCatcher);
      }
    });
    let quickPick = await vscode.window.showQuickPick(proxyNamesList.toString().split(','),{
      placeHolder: "Choose the alias configuration proxy to remove.",
    });
    if(quickPick != null && quickPick.length > 0){
      if(quickPick != 'currentProxy'){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Remove '${quickPick}' alias configuration proxy.`);
          let result = cp.exec(`grails remove-proxy ${quickPick}`,{cwd: getWorkspaceDir()});
          result.stdout.on("data", (data) => {
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
            }
            resolve();
          });
        });
        return promise;
      }else{
        vscode.window.showWarningMessage(`To remove de currentProxy configuration, go to ProxySettings.groovy and delete the line of file and run this command again.`);
      }
    }
  }
}

async function setProxy(){
  if(!filterVersion(getGrailsVersion(),'set-proxy')){
    vscode.window.showErrorMessage(`The 'set-proxy' method is deprecated.`);
  }else{
    let file = path.join(`${os.homedir()}/.grails`,'ProxySettings.groovy');
    let data = fs.readFileSync(file,'utf-8');
    let lines = data.split(/\r?\n/);
    let proxyNamesCatcher;
    let proxyNamesList = [];
    lines.forEach((line) =>{
      if(line.length > 0){
        proxyNamesCatcher = line.match(/(^\w+)/gi);
        if(line != 'currentProxy'){
          proxyNamesList.push(proxyNamesCatcher);
        }
      }
    });
    let quickPick = await vscode.window.showQuickPick(proxyNamesList.toString().split(','),{
      placeHolder: "Choose the alias configuration proxy to setup.",
    });
    if(quickPick != null && quickPick.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Set alias configuration proxy to '${quickPick}'.`);
        let result = cp.exec(`grails set-proxy ${quickPick}`,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data) => {
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
          }
          resolve();
        });
      });
      return promise;
    }
  }
}

//Objects Creation Functions

function createApp(){
  vscode.window.showOpenDialog(cts.optCreateApp).then(folder => {
    if(folder != null && folder.length > 0){
      vscode.window.showInputBox(cts.optInputAppName).then(appName =>{
        if(appName != null && appName.length > 0){
          grailsChannel.show();
          let promise = new Promise(resolve => {
            vscode.window.showInformationMessage(`Creating App '${appName}'...`);
            setStatusBarItem('create');
            let result = cp.exec(`grails create-app ${appName}`, {cwd: folder[0].fsPath});
            result.stdout.on("data", (data) => {
              outputFilter  = data;
              infoCatcher   = outputFilter.match(/\w.+/gi);
              createCatcher = outputFilter.match(/Created Grails Application/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  let terminal = vscode.window.createTerminal({cwd: folder[0].fsPath});
                  terminal.sendText(`code -r ${appName}`);
                  terminal.dispose;
                  setStatusBarItem('done');
                }
              }
              resolve();
            });
          });
          return promise;
        }
      });
    }
  });
}

function createPlugin(){
  vscode.window.showOpenDialog(cts.optCreatePlugin).then(folder =>{
    if(folder != null && folder.length > 0){
      vscode.window.showInputBox(cts.optInputPluginName).then(pluginName =>{
        if(pluginName != null && pluginName.length > 0){
          grailsChannel.show();
          let promise = new Promise(resolve =>{
            vscode.window.showInformationMessage(`Creating Plugin '${pluginName}'...`);
            let result = cp.exec(`grails create-plugin ${pluginName}`, {cwd: folder[0].fsPath});
            result.stdout.on("data", (data) => {
              outputFilter = data;
              infoCatcher  = outputFilter.match(/\w.+/gi);
              createCatcher = outputFilter.match(/Created plugin/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  let terminal = vscode.window.createTerminal({cwd: folder[0].fsPath});
                  terminal.sendText(`code -r ${pluginName}`);
                  terminal.dispose;
                }
              }
              resolve();
            });
          });
          return promise;
        }
      });
    }
  });
}

function createDomainClass(){
  vscode.window.showInputBox(cts.optInputDomainName).then(domainName =>{
    if(domainName != null && domainName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${domainName}' Domain Class...`);
        let result = cp.exec(`grails create-domain-class ${domainName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Domain Class '${domainName}' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createController(){
  vscode.window.showInputBox(cts.optInputControllerName).then(controllerName =>{
    if(controllerName != null && controllerName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${controllerName}' Controller...`);
        let result = cp.exec(`grails create-controller ${controllerName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app\/controllers/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Controller '${controllerName}Controller' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createService(){
  vscode.window.showInputBox(cts.optInputServiceName).then(serviceName =>{
    if(serviceName != null && serviceName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${serviceName}' Service...`);
        let result = cp.exec(`grails create-service ${serviceName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file grails-app\/services/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Service '${serviceName}Service' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createFilter(){
  if(!filterVersion(getGrailsVersion(),'create-filter')){
    vscode.window.showErrorMessage(`The 'create-filter' method is deprecated. Use 'create-interceptior'.`);
  }else{
    vscode.window.showInputBox(cts.optInputFilterName).then(filterName =>{
      if(filterName != null && filterName.length > 0){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Creating '${filterName}' Filter...`);
          let result = cp.exec(`grails create-filter ${filterName}`,{cwd: getWorkspaceDir()});
          result.stdout.on("data", (data) =>{
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            createCatcher = outputFilter.match(/Created file grails-app\/conf/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
              if(createCatcher != null){
                vscode.window.showInformationMessage(`Filter '${filterName}' was created.`);
              }
            }
            resolve();
          });
        });
        return promise;
      }
    });
  }
}

function createInterceptor(){
  if(!filterVersion(getGrailsVersion(),'create-interceptor')){
    vscode.window.showErrorMessage(`The 'create-interceptor' method not supported in Grails Version < 3. Use 'create-filters'.`);
  }else{
    vscode.window.showInputBox(cts.optInputInterceptorName).then(interceptorName =>{
      if(interceptorName != null && interceptorName.length > 0){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Creating '${interceptorName}' Interceptor...`);
          let result = cp.exec(`grails create-interceptor ${interceptorName}`, {cwd: getWorkspaceDir()});
          result.stdout.on("data", (data)=>{
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            //revisar
            createCatcher = outputFilter.match(/Created file grails-app/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
              if(createCatcher != null){
                vscode.window.showInformationMessage(`Interceptor '${interceptorName}' was created.`);
              }
            }
            resolve();
          });
        });
        return promise;
      }
    });
  }
}

function createHibernateCfgXML(){
  let hibernateFile = path.join(getWorkspaceDir(),'grails-app/conf/hibernate/hibernate.cfg.xml');
  if(fs.existsSync(hibernateFile)){
    vscode.window.showWarningMessage(`The file 'hibernate.cfg.xml' already exists. Overwrite it?`, 'Yes', 'No').then(selection =>{
      if(selection === 'Yes'){
        try{
          fs.unlinkSync(hibernateFile);
          grailsChannel.show();
          let promise = new Promise(resolve =>{
            let result = cp.exec(`grails create-hibernate-cfg-xml`,{cwd: getWorkspaceDir()});
            result.stdout.on("data",(data)=>{
              outputFilter     = data;
              infoCatcher      = outputFilter.match(/\w.+/gi);
              createCatcher    = outputFilter.match(/Created file grails-app\\conf\\hibernate\\hibernate.cfg.xml/gi);
              if(infoCatcher != null){
                grailsChannel.append(`${infoCatcher[0]}\n`);
                if(createCatcher != null){
                  vscode.window.showInformationMessage(`The 'hibernate.cfg.xml' file was created.`);
                }
              }
              resolve();
            });
          });
          return promise;
        }catch(err){
          console.error(err);
        }
      }else{
        vscode.window.showInformationMessage(`Operation canceled by user.`);
      }
    });
  }
}

function createScript(){
  vscode.window.showInputBox(cts.optInputScriptName).then(scriptName =>{
    if(scriptName != null && scriptName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${scriptName}' Script...`);
        let result = cp.exec(`grails create-script ${scriptName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data",(data) =>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file scripts/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Script '${scriptName}.groovy' was created.`);
            }
          } 
          resolve();
        });
      });
      return promise;
    }
  });
}

function createTagLib(){
  vscode.window.showInputBox(cts.optInputTagLibName).then(tagLibName =>{
    if(tagLibName != null && tagLibName.length > 0){
      grailsChannel.show();
      let command = '';
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${tagLibName}' Taglib...`);
        if(parseInt(grailsVersion[0]) < 3){
          command = `grails create-tag-lib ${tagLibName}`;
        }else{
          command = `grails create-taglib ${tagLibName}`;
        }
        let result = cp.exec(command,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created grails-app/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Taglib '${tagLibName}TagLib.groovy' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createUnitTest(){
  vscode.window.showInputBox(cts.optInputUnitTestName).then(unitTestName =>{
    if(unitTestName != null && unitTestName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${unitTestName}' Unit Test...`);
        let result = cp.exec(`grails create-unit-test ${unitTestName}`,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter  = data;
          infoCatcher   = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file test/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Unit Test '${unitTestName}Spec.groovy' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createIntegrationTest(){
  vscode.window.showInputBox(cts.optInputIntegrationTestName).then(integrationTestName =>{
    if(integrationTestName != null && integrationTestName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Creating '${integrationTestName}' Integration Test...`);
        let result = cp.exec(`grails create-integration-test ${integrationTestName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          createCatcher = outputFilter.match(/Created file test/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
            if(createCatcher != null){
              vscode.window.showInformationMessage(`Integration Test '${integrationTestName}IntegrationSpec.groovy' was created.`);
            }
          }
          resolve();
        });
      });
      return promise;
    }
  });
}

function createPOM(){
  if(!filterVersion(getGrailsVersion(),'create-pom')){
    vscode.window.showErrorMessage(`The 'create-pom' method is deprecated.`);
  }else{
    vscode.window.showInputBox(cts.optInputPomGroupId).then(groupIdName =>{
      if(groupIdName != null && groupIdName.length > 0){
        grailsChannel.show();
        let promise = new Promise(resolve =>{
          vscode.window.showInformationMessage(`Creating POM.xml with '${groupIdName}' group id...`);
          let result = cp.exec(`grails create-pom ${groupIdName}`, {cwd: getWorkspaceDir()});
          result.stdout.on("data",(data)=>{
            outputFilter = data;
            infoCatcher  = outputFilter.match(/\w.+/gi);
            createCatcher = outputFilter.match(/POM generated/gi);
            if(infoCatcher != null){
              grailsChannel.append(`${infoCatcher[0]}\n`);
              if(createCatcher != null){
                vscode.window.showInformationMessage(`The POM.xml file was created.`);
              }
            }
            resolve();
          });
        });
        return promise;
      }
    });
  }
}

//Generates
function generateViews(){
  vscode.window.showInputBox(cts.optInputGenerateViews).then(generateName=>{
    if(generateName != null && generateName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Generate Views...`);
        let result = cp.exec(`grails generate-views ${generateName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
          }
        });
        result.stdout.on("end",()=>{
          grailsChannel.append(`Done!`);
        });
        resolve();
      });
      return promise;
    }
  });
}

function generateControllers(){
  vscode.window.showInputBox(cts.optInputGenerateControllers).then(generateName=>{
    if(generateName != null && generateName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Generate Controllers...`);
        let result = cp.exec(`grails generate-controller ${generateName}`, {cwd: getWorkspaceDir()});
        result.stdout.on("data",(data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
          }
        });
        result.stdout.on("end",()=>{
          grailsChannel.append(`Done!`);
        });
        resolve();
      });
      return promise;
    }
  });
}

function generateAll(){
  vscode.window.showInputBox(cts.optInputGenerateAll).then(generateName=>{
    if(generateName != null && generateName.length > 0){
      grailsChannel.show();
      let promise = new Promise(resolve =>{
        vscode.window.showInformationMessage(`Generate Views and Controllers...`);
        let result = cp.exec(`grails generate-all ${generateName}`,{cwd: getWorkspaceDir()});
        result.stdout.on("data", (data)=>{
          outputFilter = data;
          infoCatcher  = outputFilter.match(/\w.+/gi);
          if(infoCatcher != null){
            grailsChannel.append(`${infoCatcher[0]}\n`);
          }
        });
        result.stdout.on("end",()=>{
          grailsChannel.append(`Done!`);
        });
        resolve();
      });
      return promise;
    }
  });
}



module.exports ={
  showGrailsChannel,
  getWorkspaceDir,
  checkIfIsAGrailsProject,
  checkIfIsAGrailsPlugin,
  defineAppProperties,
  getGrailsVersion,
  setStatusBarItem,
  getFileListFolder,
  filterVersion,
  runApp,
  stopApp,
  grailsRunCommand,
  cleanProject,
  compileProject,
  showDependencyReport,
  showHelp,
  listPlugins,
  showConsole,
  showStats,
  generateDoc,
  migrateDocs,
  createWar,
  packagePlugin,
  mavenInstall,
  addProxy,
  clearProxy,
  removeProxy,
  setProxy,
  createApp,  
  createPlugin,
  createDomainClass,
  createController,
  createService,
  createFilter,
  createInterceptor,
  createHibernateCfgXML,
  createScript,
  createTagLib,
  createUnitTest,
  createIntegrationTest,
  createPOM,
  generateViews,
  generateControllers,
  generateAll
}