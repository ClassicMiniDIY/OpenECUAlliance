<script setup lang="ts">
  useSeoMeta({
    title: 'Project Charter - OpenECU Alliance',
    description: 'The mission, values, and governance of the OpenECU Alliance and the process for projects to join.',
  });

  const coreValues = [
    {
      title: 'Openness',
      description:
        'All Alliance specifications and projects are open: freely available, source code is open source, development happens in public, decisions are made transparently.',
      icon: 'i-heroicons-globe-alt',
    },
    {
      title: 'Community First',
      description:
        'The Alliance serves the automotive enthusiast community: user needs drive feature priorities, contributors are valued, feedback channels are maintained.',
      icon: 'i-heroicons-user-group',
    },
    {
      title: 'Quality',
      description:
        'Alliance projects maintain high standards: code is reviewed before merging, tests validate functionality, documentation accompanies features.',
      icon: 'i-heroicons-shield-check',
    },
    {
      title: 'Sustainability',
      description:
        'Projects should outlast their original creators: knowledge is documented, multiple maintainers are cultivated, dependencies are carefully managed.',
      icon: 'i-heroicons-arrow-path',
    },
    {
      title: 'Vendor Neutrality',
      description:
        'The Alliance does not favor any vendor: all ECU manufacturers are supported equally, no exclusive partnerships, community decides priorities.',
      icon: 'i-heroicons-scale',
    },
  ];

  const inScope = [
    {
      title: 'ECU Log Standards',
      description: 'Specifications for log file formats and channel mappings',
    },
    {
      title: 'Log Analysis Tools',
      description: 'Applications that read, visualize, and analyze ECU data',
    },
    {
      title: 'Tuning Utilities',
      description: 'Tools that assist with ECU calibration and tuning',
    },
    {
      title: 'Data Export/Import',
      description: 'Converters between formats',
    },
    {
      title: 'Educational Resources',
      description: 'Documentation helping users understand ECU data',
    },
  ];

  const outOfScope = [
    'ECU firmware or embedded software',
    'Commercial tuning software',
    'Hardware products',
    'Projects unrelated to automotive ECU data',
  ];

  const benefitsOwners = [
    {
      benefit: 'Sustainability',
      description: 'Project lives on even if you step back',
    },
    {
      benefit: 'Contributors',
      description: 'Access to Alliance contributor pool',
    },
    {
      benefit: 'Credibility',
      description: 'Association with established organization',
    },
    {
      benefit: 'Infrastructure',
      description: 'GitHub org, CI/CD, hosting support',
    },
    {
      benefit: 'Community',
      description: 'Connection to broader ecosystem',
    },
  ];

  const benefitsUsers = [
    {
      benefit: 'Longevity',
      description: 'Reduced risk of project abandonment',
    },
    { benefit: 'Quality', description: 'Alliance quality standards' },
    {
      benefit: 'Integration',
      description: 'Better integration with other Alliance projects',
    },
    { benefit: 'Support', description: 'Community support channels' },
  ];

  const eligibilityCriteria = [
    {
      criterion: 'Relevance',
      requirement: 'Related to ECU data, logging, tuning, or analysis',
    },
    {
      criterion: 'Maturity',
      requirement: 'Functional software with existing users',
    },
    {
      criterion: 'License',
      requirement: 'Open source (OSI-approved) or willing to relicense',
    },
    {
      criterion: 'Quality',
      requirement: 'Reasonable code quality, some documentation',
    },
    {
      criterion: 'Maintenance',
      requirement: 'Current owner willing to participate in transition',
    },
    {
      criterion: 'Community Fit',
      requirement: 'Aligns with Alliance mission and values',
    },
  ];

  const donationSteps = [
    {
      step: 1,
      title: 'Express Interest',
      description: 'Open a discussion in the OECUASpecs repository with project details',
    },
    {
      step: 2,
      title: 'Initial Review',
      description: 'Steering Committee reviews scope, technical soundness, and community interest (2-4 weeks)',
    },
    {
      step: 3,
      title: 'Due Diligence',
      description: 'Code review for quality/security, license verification, dependency audit',
    },
    {
      step: 4,
      title: 'Community Discussion',
      description: '30-day public comment period for community feedback',
    },
    {
      step: 5,
      title: 'Steering Committee Vote',
      description: 'Requires supermajority (2/3) approval',
    },
    {
      step: 6,
      title: 'Transfer',
      description: 'Repository transferred, CI/CD configured, announcement published',
    },
  ];

  const projectStates = [
    {
      state: 'Incubating',
      description: 'New projects in evaluation period',
      color: 'warning',
    },
    {
      state: 'Active',
      description: 'Fully maintained, accepting contributions',
      color: 'success',
    },
    {
      state: 'Maintenance',
      description: 'Bug fixes only, no new features',
      color: 'neutral',
    },
    {
      state: 'Archived',
      description: 'No longer maintained, read-only',
      color: 'error',
    },
  ];

  const comparisonTable = [
    {
      aspect: 'Ownership',
      specCompatible: 'Independent',
      allianceProject: 'Alliance',
    },
    {
      aspect: 'Governance',
      specCompatible: 'Self-governed',
      allianceProject: 'Alliance governance',
    },
    {
      aspect: 'Maintenance',
      specCompatible: "Owner's responsibility",
      allianceProject: 'Community responsibility',
    },
    {
      aspect: 'Branding',
      specCompatible: '"Spec-Compatible" badge',
      allianceProject: '"Alliance Project" badge',
    },
    {
      aspect: 'Requirements',
      specCompatible: 'Implement spec',
      allianceProject: 'Implement spec + Alliance processes',
    },
    {
      aspect: 'Support',
      specCompatible: 'Owner provides',
      allianceProject: 'Alliance community',
    },
  ];
</script>

<template>
  <div class="py-8 px-4">
    <UContainer class="max-w-4xl">
      <div class="mb-2">
        <NuxtLink to="/docs" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-left" class="size-4" />
          Back to Docs
        </NuxtLink>
      </div>

      <div class="mb-8">
        <UBadge color="primary" variant="subtle" class="mb-4"> Version 1.0.0 </UBadge>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Project Charter</h1>
        <p class="text-lg text-muted">
          The mission, values, and governance of the OpenECU Alliance and the process for projects to join.
        </p>
      </div>

      <!-- Mission Statement -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Mission Statement</h2>
        <UCard class="bg-primary/5 border-primary/20">
          <div class="text-center py-4">
            <p class="text-lg font-medium">
              "Standardize, simplify, and democratize access to ECU data through open specifications and
              community-maintained tools."
            </p>
          </div>
        </UCard>
        <div class="mt-4 grid sm:grid-cols-2 gap-4">
          <UCard>
            <p class="text-sm text-muted">
              <strong>We believe that:</strong>
            </p>
            <ul class="mt-2 space-y-2 text-sm text-muted">
              <li class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success shrink-0 mt-0.5" />
                ECU data should be accessible to enthusiasts, tuners, and developers alike
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success shrink-0 mt-0.5" />
                Open standards foster innovation and interoperability
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success shrink-0 mt-0.5" />
                Community maintenance ensures long-term project sustainability
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success shrink-0 mt-0.5" />
                Collaboration produces better outcomes than fragmentation
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- Core Values -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Core Values</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="value in coreValues" :key="value.title">
            <div class="flex items-start gap-3">
              <div class="bg-primary/10 p-2 rounded-lg shrink-0">
                <UIcon :name="value.icon" class="size-5 text-primary" />
              </div>
              <div>
                <h3 class="font-semibold mb-1">{{ value.title }}</h3>
                <p class="text-sm text-muted">{{ value.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Scope -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Scope</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-4 text-success">In Scope</h3>
            <div class="space-y-3">
              <div v-for="item in inScope" :key="item.title" class="flex items-start gap-2">
                <UIcon name="i-heroicons-check-circle" class="size-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-sm">{{ item.title }}</p>
                  <p class="text-sm text-muted">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-4 text-error">Out of Scope</h3>
            <ul class="space-y-2">
              <li v-for="item in outOfScope" :key="item" class="flex items-center gap-2 text-sm text-muted">
                <UIcon name="i-heroicons-x-circle" class="size-5 text-error" />
                {{ item }}
              </li>
            </ul>
          </UCard>
        </div>
      </section>

      <!-- What is an Alliance Project -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">What is an Alliance Project?</h2>
        <UCard>
          <p class="text-muted mb-4">
            An Alliance Project is software that has been donated to the OpenECU Alliance for long-term community
            maintenance. Unlike Spec-Compatible applications (which are independently maintained), Alliance Projects:
          </p>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Are hosted under OpenECU Alliance GitHub organization
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Are maintained by Alliance contributors
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Follow Alliance governance and quality standards
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              May use Alliance branding and trademarks
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-heroicons-check" class="size-4 text-success" />
              Receive community support resources
            </li>
          </ul>
        </UCard>
      </section>

      <!-- Benefits -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Benefits of Becoming an Alliance Project</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <UCard>
            <h3 class="font-semibold mb-4">For Project Owners</h3>
            <div class="space-y-3">
              <div v-for="item in benefitsOwners" :key="item.benefit" class="flex items-start gap-2">
                <UIcon name="i-heroicons-star" class="size-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <span class="font-medium text-sm">{{ item.benefit }}</span>
                  <span class="text-sm text-muted"> - {{ item.description }}</span>
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <h3 class="font-semibold mb-4">For Users</h3>
            <div class="space-y-3">
              <div v-for="item in benefitsUsers" :key="item.benefit" class="flex items-start gap-2">
                <UIcon name="i-heroicons-heart" class="size-4 text-error shrink-0 mt-0.5" />
                <div>
                  <span class="font-medium text-sm">{{ item.benefit }}</span>
                  <span class="text-sm text-muted"> - {{ item.description }}</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Eligibility Criteria -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Eligibility Criteria</h2>
        <UCard>
          <p class="text-muted mb-4">To be considered for donation, a project must meet these criteria:</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Criterion</th>
                  <th class="text-left py-2 font-semibold">Requirement</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in eligibilityCriteria" :key="item.criterion" class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">{{ item.criterion }}</td>
                  <td class="py-2 text-muted">{{ item.requirement }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </section>

      <!-- Donation Process -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Project Donation Process</h2>
        <div class="space-y-4">
          <UCard v-for="item in donationSteps" :key="item.step">
            <div class="flex items-start gap-4">
              <div
                class="flex items-center justify-center size-10 bg-primary text-primary-foreground rounded-full font-bold shrink-0"
              >
                {{ item.step }}
              </div>
              <div>
                <h3 class="font-semibold mb-1">{{ item.title }}</h3>
                <p class="text-sm text-muted">{{ item.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- Project Lifecycle -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Project Lifecycle</h2>
        <UCard>
          <h3 class="font-semibold mb-4">Project States</h3>
          <div class="grid sm:grid-cols-2 gap-3">
            <div
              v-for="item in projectStates"
              :key="item.state"
              class="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <UBadge :color="item.color" variant="subtle">
                {{ item.state }}
              </UBadge>
              <span class="text-sm text-muted">{{ item.description }}</span>
            </div>
          </div>

          <div class="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 class="font-semibold mb-2">Incubation Period</h4>
            <p class="text-sm text-muted mb-2">
              New Alliance Projects enter a 6-month incubation period and are evaluated for quality and community
              engagement. Graduation criteria:
            </p>
            <ul class="text-sm text-muted space-y-1">
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Active maintainers (2+ recommended)
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Passing CI/CD pipeline
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Documentation complete
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-heroicons-check" class="size-4 text-success" />
                Community engagement demonstrated
              </li>
            </ul>
          </div>
        </UCard>
      </section>

      <!-- Comparison Table -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Spec-Compatible vs Alliance Project</h2>
        <UCard>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-default">
                  <th class="text-left py-2 pr-4 font-semibold">Aspect</th>
                  <th class="text-left py-2 pr-4 font-semibold">Spec-Compatible</th>
                  <th class="text-left py-2 font-semibold">Alliance Project</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in comparisonTable" :key="row.aspect" class="border-b border-default">
                  <td class="py-2 pr-4 font-medium">{{ row.aspect }}</td>
                  <td class="py-2 pr-4 text-muted">{{ row.specCompatible }}</td>
                  <td class="py-2 text-muted">{{ row.allianceProject }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-sm text-muted mt-4">
            <strong>Note:</strong> Becoming an Alliance Project is entirely optional. Many excellent applications remain
            independently maintained.
          </p>
        </UCard>
      </section>

      <!-- Contact -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold mb-4">Contact</h2>
        <UCard>
          <div class="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="font-medium mb-1">Project Donation Inquiries</p>
              <p class="text-muted">projects@openecualliance.org</p>
            </div>
            <div>
              <p class="font-medium mb-1">General Questions</p>
              <p class="text-muted">info@openecualliance.org</p>
            </div>
            <div>
              <p class="font-medium mb-1">GitHub Discussions</p>
              <a
                href="https://github.com/ClassicMiniDIY/OECUASpecs/discussions"
                target="_blank"
                class="text-primary hover:underline"
              >
                OECUASpecs Discussions
              </a>
            </div>
          </div>
        </UCard>
      </section>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row gap-4">
        <UButton to="/contribute" icon="i-heroicons-gift" size="lg"> Donate a Project </UButton>
        <UButton
          to="https://github.com/ClassicMiniDIY/OECUASpecs/blob/main/PROJECT_CHARTER.md"
          target="_blank"
          icon="i-simple-icons-github"
          color="neutral"
          variant="outline"
          size="lg"
        >
          View on GitHub
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
