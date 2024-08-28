#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figlet from 'figlet';

function printBanner() {
    console.log(
        chalk.blue(
            figlet.textSync('Vue Component CLI', { horizontalLayout: 'full' })
        )
    );
}

async function createComponent() {
    printBanner();

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'componentName',
            message: chalk.cyan('What is the name of the component?'),
        },
        {
            type: 'input',
            name: 'directory',
            message: chalk.cyan('Which directory do you want to create it in?'),
            default: './src/components',
        },
        {
            type: 'list',
            name: 'apiType',
            message: chalk.cyan('Is it a Composition API or Options API?'),
            choices: [
                { name: 'Composition API', value: 'composition' },
                { name: 'Options API', value: 'options' }
            ]
        },
        {
            type: 'confirm',
            name: 'hasProps',
            message: chalk.cyan('Does it have props?'),
        },
        {
            type: 'input',
            name: 'props',
            message: chalk.cyan('What are the props and their types (format: propName:type)?'),
            when: (answers) => answers.hasProps,
        },
    ]);

    const { componentName, directory, apiType, hasProps, props } = answers;

    const fileName = `${componentName}.vue`;
    const filePath = path.join(directory, fileName);

    let propsTemplate = '';

    if (hasProps && props) {
        const propsArray = props.split(',').map(prop => prop.trim());
        propsTemplate = propsArray.map(prop => {
            const [propName, propType] = prop.split(':').map(item => item.trim());
            const formattedPropType = propType.charAt(0).toUpperCase() + propType.slice(1).toLowerCase();
            return `${propName}: { type: ${formattedPropType}, required: true }`;
        }).join(',\n');
    }

    const componentTemplate = apiType === 'composition'
        ? `<template>
  <div>
    <!-- Component ${componentName} -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, onUnmounted } from 'vue';

${propsTemplate ? `defineProps({\n${propsTemplate}\n})` : ''}

// Reactive state
const state = ref({
  // Add your reactive state properties here
});

// Lifecycle hooks
onMounted(() => {
  // Logic to execute when component is mounted
});

onUpdated(() => {
  // Logic to execute when component is updated
});

onUnmounted(() => {
  // Logic to execute when component is unmounted
});
</script>

<style scoped>
</style>
`
        : `<template>
  <div>
    <!-- Component ${componentName} -->
  </div>
</template>

<script lang="ts">
export default {
  name: '${componentName}',${propsTemplate ? `
  props: {
${propsTemplate}
  },` : ''}

  data() {
    return {
      // Reactive data
    };
  },

  computed: {
    // Computed properties
  },

  methods: {
    // Component methods
  },

  watch: {
    // Watchers for data changes
  },

  mounted() {
    // Lifecycle hook: mounted
  }
};
</script>

<style scoped>
</style>
`;

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(filePath, componentTemplate, 'utf8');

    console.log(chalk.green(`\nComponent ${componentName} created in ${filePath} successfully!`));
}

(async () => {
    try {
        await createComponent();
    } catch (error) {
        console.error(chalk.red('Error creating the component:', error));
    }
})();
