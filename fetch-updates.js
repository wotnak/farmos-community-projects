import projects from './projects.json' assert { type: 'json' }
import { writeFile } from 'fs'

const updateModuleData = (currentData, drupalOrgData) => {
  const updatedData = currentData
  updatedData.name = drupalOrgData.title
  // @todo Update other properties.
  return updatedData
}

const fetchContribUpdates = async () => {
  const response = await fetch('https://www.drupal.org/api-d7/node.json?type=project_module&field_project_ecosystem=2208549')
  const modules = await response.json()
  // @todo Fetch contents of all api pages.

  modules.list.forEach(async moduleInfo => {
    const id = moduleInfo.field_project_machine_name
    const index = projects.projects.findIndex(item => item.id === id)

    // Update existing module.
    if (index > -1) {
      console.log(`updating existing module data ${id}`)
      const currentData = projects.projects[index]
      projects.projects[index] = updateModuleData(
        currentData,
        moduleInfo,
      )
    }
    // Add a new module.
    else {
      console.log(`adding a new module ${id}`)
      const newModuleData = updateModuleData(
        {
          id,
          type: 'contrib-module',
        },
        moduleInfo,
      )
      projects.projects.push(newModuleData)
    }
  })

  // Sort projects list by id property value.
  projects.projects.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))

  // Save changes to the projects.json file.
  const json = JSON.stringify(projects, undefined, 2) + '\n'
  writeFile('./projects.json', json, err => {
    if (err) return console.log(err);
  })

}
fetchContribUpdates()
