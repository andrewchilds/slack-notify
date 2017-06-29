slack = null
_ = require 'lodash'

describe 'No URL passed in', ->
  beforeEach ->
    spyOn(console, 'log')
    slack = require('../slack-notify.js')('')

  it 'should log to console that no URL is present', ->
    slack.send('Hello!')
    expect(console.log).toHaveBeenCalledWith('No Slack URL configured.')

describe 'API', ->
  url = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken'

  beforeEach ->
    slack = require('../slack-notify.js')(url)
    spyOn(slack, 'request')

  it 'slack.send', ->
    slack.send('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
    , undefined

  it 'slack.success', ->
    slack.success('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      channel: '#alerts'
      username: 'Hoorah'
      text: 'Hello!'
      icon_emoji: ':trophy:'
    , undefined

  it 'slack.bugs', ->
    slack.bug('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      channel: '#bugs'
      username: 'Bug'
      text: 'Hello!'
      icon_emoji: ':bomb:'
    , undefined

  it 'slack.notes', ->
    slack.note('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      channel: '#alerts'
      username: 'Note'
      text: 'Hello!'
      icon_emoji: ':bulb:'
    , undefined

  it 'slack.alerts', ->
    slack.alert('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      channel: '#alerts'
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
    , undefined

  it 'slack.alerts with extra fields', ->
    slack.alert
      text: 'Hello!'
      fields:
        IP: '123.123.123.123'
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'

    expect(slack.request).toHaveBeenCalledWith
      channel: '#alerts'
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
      attachments: [
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
    , undefined

  it 'slack.extend', ->
    foo = slack.extend
      channel: '#foo'
      icon_emoji: ':saxophone:'
      username: 'Foo'

    foo('Hello!')
    expect(slack.request).toHaveBeenCalledWith
      channel: '#foo'
      username: 'Foo'
      text: 'Hello!'
      icon_emoji: ':saxophone:'
    , undefined

  it 'slack.send with icon_url', ->
    slack.send
      text: 'Hello!'
      icon_url: 'http://something.com/icon.png'

    expect(slack.request).toHaveBeenCalledWith
      username: 'Robot'
      text: 'Hello!'
      icon_emoji : ':bell:'
      icon_url: 'http://something.com/icon.png'
    , undefined

  it 'slack.send with attachments and extra fields', ->
    slack.send
      text: 'Hello!'
      attachments: [
        {
          fallback: 'Fallback'
          fields: [
            { title: 'CPU %', value: '90%', short: true }
            { title: 'RAM %', value: '47%', short: true }
          ]
        }
      ]
      fields:
        IP: '123.123.123.123'
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'

    expect(slack.request).toHaveBeenCalledWith
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      attachments: [
        {
          fallback: 'Fallback'
          fields: [
            { title: 'CPU %', value: '90%', short: true }
            { title: 'RAM %', value: '47%', short: true }
          ]
        },
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ], undefined

describe 'API with multiple channels', ->
  url = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken'
  args = []

  beforeEach ->
    args = []
    slack = require('../slack-notify.js')(url)
    spyOn(slack, 'request').andCallFake -> 
      args.push(_.clone(arguments[0]))

  it 'slack.send with plural', ->
    slack.send
      text: 'Hello!'
      channels: ['#foo', '#bar']

    expect(args[0]).toEqual
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      channel: '#foo'
      channels: ['#foo', '#bar']
    expect(args[1]).toEqual
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      channel: '#bar'
      channels: ['#foo', '#bar']

  it 'slack.send', ->
    slack.send
      text: 'Hello!'
      channel: ['#foo', '#bar']

    expect(args[0]).toEqual
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      channel: '#bar'

  it 'slack.success', ->
    slack.success
      text: 'Hello!'
      channel: ['#foo', '#bar']

    expect(args[0]).toEqual
      username: 'Hoorah'
      text: 'Hello!'
      icon_emoji: ':trophy:'
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Hoorah'
      text: 'Hello!'
      icon_emoji: ':trophy:'
      channel: '#bar'

  it 'slack.bugs', ->
    slack.bug
      text: 'Hello!'
      channel: ['#foo', '#bar']
    
    expect(args[0]).toEqual
      username: 'Bug'
      text: 'Hello!'
      icon_emoji: ':bomb:'
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Bug'
      text: 'Hello!'
      icon_emoji: ':bomb:'
      channel: '#bar'

  it 'slack.notes', ->
    slack.note
      text: 'Hello!'
      channel: ['#foo', '#bar']

    expect(args[0]).toEqual
      username: 'Note'
      text: 'Hello!'
      icon_emoji: ':bulb:'
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Note'
      text: 'Hello!'
      icon_emoji: ':bulb:'
      channel: '#bar'

  it 'slack.alerts', ->
    slack.alert
      text: 'Hello!'
      channel: ['#foo', '#bar']
    
    expect(args[0]).toEqual
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
      channel: '#bar'

  it 'slack.alerts with extra fields', ->
    slack.alert
      text: 'Hello!'
      channel: ['#foo', '#bar']
      fields:
        IP: '123.123.123.123'
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'

    expect(args[0]).toEqual
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
      attachments: [
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
      channel: '#foo'
    expect(args[1]).toEqual
      username: 'Alert'
      text: 'Hello!'
      icon_emoji: ':warning:'
      attachments: [
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
      channel: '#bar'

  it 'slack.extend', ->
    foo = slack.extend
      channel: ['#foo', '#bar']
      icon_emoji: ':saxophone:'
      username: 'Foo'

    foo('Hello!')

    expect(args[0]).toEqual
      channel: '#foo'
      username: 'Foo'
      text: 'Hello!'
      icon_emoji: ':saxophone:'
    expect(args[1]).toEqual
      channel: '#bar'
      username: 'Foo'
      text: 'Hello!'
      icon_emoji: ':saxophone:'

  it 'slack.send with icon_url', ->
    slack.send
      channel: ['#foo', '#bar']
      text: 'Hello!'
      icon_url: 'http://something.com/icon.png'

    expect(args[0]).toEqual
      channel: '#foo'
      username: 'Robot'
      text: 'Hello!'
      icon_emoji : ':bell:'
      icon_url: 'http://something.com/icon.png'
    expect(args[1]).toEqual
      channel: '#bar'
      username: 'Robot'
      text: 'Hello!'
      icon_emoji : ':bell:'
      icon_url: 'http://something.com/icon.png'

  it 'slack.send with attachments and extra fields', ->
    slack.send
      channel: ['#foo', '#bar']
      text: 'Hello!'
      attachments: [
        {
          fallback: 'Fallback'
          fields: [
            { title: 'CPU %', value: '90%', short: true }
            { title: 'RAM %', value: '47%', short: true }
          ]
        }
      ]
      fields:
        IP: '123.123.123.123'
        sha: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12'

    expect(args[0]).toEqual
      channel: '#foo'
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      attachments: [
        {
          fallback: 'Fallback'
          fields: [
            { title: 'CPU %', value: '90%', short: true }
            { title: 'RAM %', value: '47%', short: true }
          ]
        },
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
    expect(args[1]).toEqual
      channel: '#bar'
      username: 'Robot'
      text: 'Hello!'
      icon_emoji: ':bell:'
      attachments: [
        {
          fallback: 'Fallback'
          fields: [
            { title: 'CPU %', value: '90%', short: true }
            { title: 'RAM %', value: '47%', short: true }
          ]
        },
        {
          fallback: 'Alert details'
          fields: [
            { title: 'IP', value: '123.123.123.123', short: true }
            { title: 'sha', value: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12', short: false }
          ]
        }
      ]
