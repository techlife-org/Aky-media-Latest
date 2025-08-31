import { NextRequest, NextResponse } from 'next/server'
import TemplateService from '@/lib/template-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      category, 
      type, 
      variables = {},
      templateId,
      content,
      subject
    } = body

    if (!category || !type) {
      return NextResponse.json(
        { success: false, error: 'Category and type are required' },
        { status: 400 }
      )
    }

    const templateService = TemplateService

    // Prepare default variables
    const defaultVariables = {
      ...templateService.getCommonVariables(),
      name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348161781643',
      mobile: '+2348161781643',
      subject: 'Sample Subject',
      ...variables
    }

    let previewResult

    if (templateId) {
      // Preview existing template by ID
      const template = await templateService.getTemplate(category, type)
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }

      previewResult = {
        subject: template.subject ? templateService.applyVariables(template.subject, defaultVariables) : undefined,
        content: templateService.applyVariables(template.content, defaultVariables),
        variables: template.variables,
        isCustomTemplate: true,
        templateName: template.name
      }
    } else if (content) {
      // Preview custom content
      previewResult = {
        subject: subject ? templateService.applyVariables(subject, defaultVariables) : undefined,
        content: templateService.applyVariables(content, defaultVariables),
        variables: templateService.extractVariables(content + (subject || '')),
        isCustomTemplate: false,
        templateName: 'Custom Preview'
      }
    } else {
      // Preview template with fallback
      const template = await templateService.getTemplateWithFallback(category, type, defaultVariables)
      
      previewResult = {
        subject: template.subject,
        content: template.content,
        isCustomTemplate: template.isCustomTemplate,
        templateName: template.isCustomTemplate ? 'Custom Template' : 'Default Template'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        category,
        type,
        preview: previewResult,
        usedVariables: defaultVariables,
        availableVariables: templateService.getCommonVariables()
      }
    })

  } catch (error) {
    console.error('Template preview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate template preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const type = searchParams.get('type')

  if (!category || !type) {
    return NextResponse.json({
      success: true,
      message: 'Template preview endpoint',
      usage: {
        method: 'POST',
        body: {
          category: 'subscribers | contact-us',
          type: 'email | sms | whatsapp',
          variables: 'object (optional) - custom variables to use in preview',
          templateId: 'string (optional) - preview specific template by ID',
          content: 'string (optional) - preview custom content',
          subject: 'string (optional) - preview custom subject (for email)'
        }
      },
      availableCategories: ['subscribers', 'contact-us'],
      availableTypes: ['email', 'sms', 'whatsapp'],
      commonVariables: TemplateService.getCommonVariables()
    })
  }

  try {
    const templateService = TemplateService
    const defaultVariables = {
      ...templateService.getCommonVariables(),
      name: 'John Doe',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+2348161781643',
      mobile: '+2348161781643',
      subject: 'Sample Subject'
    }

    const template = await templateService.getTemplateWithFallback(category, type, defaultVariables)
    
    return NextResponse.json({
      success: true,
      data: {
        category,
        type,
        preview: {
          subject: template.subject,
          content: template.content,
          isCustomTemplate: template.isCustomTemplate,
          templateName: template.isCustomTemplate ? 'Custom Template' : 'Default Template'
        },
        usedVariables: defaultVariables
      }
    })

  } catch (error) {
    console.error('Template preview error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate template preview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}