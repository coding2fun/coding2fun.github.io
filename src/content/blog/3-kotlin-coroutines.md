---
author: Kishore Karunakaran
pubDatetime: 2022-07-10T05:04:05Z
title: Kotlin Coroutines and JVM – Writing Non Blocking Code With Ease
postSlug: kotlin-coroutines-jvm
featured: true
draft: false
tags:
  - kotlin
  - jvm
  - coroutines
  - spring-boot
ogImage: "/assets/coroutines/image.png"
description:
  The systems we build nowadays don’t really do a lot of computation, instead they communicate between services such as Database, REST API’s, etc. If you look deeper we are building a system that wait’s most of the time. We send a request to the server and we wait for the response. Microservices, Rest API that’s part of our daily life. So, What’s the problem with waiting ?
---
<!-- wp:paragraph -->
<p>The systems we build nowadays don’t really do a lot of computation, instead they communicate between services such as Database, REST API’s, etc. If you look deeper we are building a system that wait’s most of the time. We send a request to the server and we wait for the response. Microservices, Rest API that’s part of our daily life. So, What’s the problem with waiting ?</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Whenever you perform an IO bounded operation in your service whether it’s an database or API call to other services the thread which is assigned to perform this operation will also get blocked. Also what if the service which we are calling is slow service and we don’t have any control over it. Over time you can quickly endup with only executors threads being blocked because just one of your services is slow. What we have now is that most of our code does not spend it’s time consuming CPU to do some work.</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/image.png"></img>

<p>
    <center>Cascading Failure Because of Slow Service</center>
</p>

<!-- wp:paragraph -->
<p>One can overcome this using asynchronous processing. The solution to the problem is instead of blocking a thread while you wait we release the thread in wait without blocking and whenever we get the response back then we find a thread to process the result. This asynchronous processing can be written in one of the following ways</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>callbacks</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>futures/promises/reactive</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>The problem with these approaches is that code becomes so messy that we need to deal with a lot of combinational/callback methods and also error handling becomes very difficult and in the end you will end up losing the business intent of the code. This is exactly where Kotlin coroutines can help us.</p>
<!-- /wp:paragraph -->

## Table of contents

## What are Coroutines ?
<!-- wp:paragraph -->
<p>Coroutines are lightweight and cooperative multitasking systems where tasks voluntarily yield in order to allow other tasks to run. The beauty of Kotlin coroutines is developers can write concurrent code as sequential code.</p>
<!-- /wp:paragraph -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column {"width":"100%"} -->
<div class="wp-block-column" style="flex-basis:100%"><!-- wp:paragraph -->
<p><strong>Lightweight:</strong> Coroutines are not threads, We could easily create hundreds of thousands of them without running out of memory</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Cooperative:</strong> The OS doesn't have to context switch as it does for threads. The coroutines can suspend and resume at any point of time, so they cooperatively progress. Also, they can be supervised and utilise channel to communicate.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Sequential Code:</strong> You can write concurrent code as non concurrent/sequential code. So code is more developer friendly and readable not like threads, async callbacks, futures, etc.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>If we compared to regular&nbsp;<a rel="noreferrer noopener" href="https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html" target="_blank">Threads</a>, Kotlin coroutines are very lightweight because thread has its own stack typically 1MB. 64KB is the least amount of stack space allowed per thread in the JVM while a simple coroutine in kotlin occupies only a few dozen bytes of heap memory.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

```kotlin
import kotlinx.coroutines.*

//Start
fun main() = runBlocking {
    repeat(100_00_00){ // launches one million coroutines
        launch{
            delay(10000) // Wait for 10 Seconds
            print(".")
        }
    }
}
```
<!-- wp:paragraph -->
<p>The above code create’s a 100K coroutines, If we try to perform the same operation using java threads we will be getting&nbsp;<a rel="noreferrer noopener" href="https://docs.oracle.com/javase/7/docs/api/java/lang/OutOfMemoryError.html" target="_blank">OutOfMemoryError</a>. Coroutines are also suspendable, meaning that when a coroutine is waiting for an external response (such as a network response or a device I/O) it becomes suspended and the Kotlin scheduler moves this coroutine off the thread. The same thread can then pick up other coroutines waiting to be executed. This way coroutines appear always to be executing concurrently (but may not be simultaneously). Also kotlin coroutines follows a structured concurrency which means new coroutines can only be launched in a specific coroutine scope hence there are clear entry and exit points.</p>
<!-- /wp:paragraph -->

<img src="/assets/coroutines/suspend.png"></img>

## Demo
<!-- wp:paragraph -->
<p>This article is accompanied by a working code example&nbsp;<a rel="noreferrer noopener" href="https://github.com/thombergs/code-examples/tree/master/spring-boot/specification" target="_blank"><strong>on&nbsp;</strong></a><a href="https://github.com/khekrn/coding2fun/tree/master/Kotlin-Coroutines" target="_blank" rel="noreferrer noopener"><strong>GitHub</strong></a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Let’s build a simple REST API to save the user details. We will be implementing in two approaches</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Thread Per Request(Spring  MVC)</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Using Non Blocking Coroutines(Spring Reactive)</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>The API <code>/api/v1/{blocking/coroutine}/user?delay=1000</code>  takes <strong>name</strong> and <strong>emailId</strong> as request body and <strong>delay</strong> as http request param. The delay attribute is used to simulate IO blocking operations which will be passed to downstream API’s. Before saving the user details we invoke two more API’s.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Email Validation API</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Random Avatar API</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Both the API’s take the delay attribute as an input and wait's before sending the response. These two API’s are build in node.js as shown below&nbsp;</p>
<!-- /wp:paragraph -->

### Validation and Avatar API
```js
//Load express module with `require` directive
var express = require('express')
var app = express()

var images = ['https://www.clipartmax.com/png/small/204-2045046_there-appears-to-be-a-whale-on-the-bottom-docker-image-icon.png',
    'https://66.media.tumblr.com/6cf47a664464b02bff6c64ff959d4355/tumblr_pft74oWO4f1s3vdozo1_1280.jpg',
    'http://3.bp.blogspot.com/-A-bbtwJwI8s/Uek2HQvuFhI/AAAAAAAABQM/F91QmX3SLz0/s1600/220px-Tux.png',
    'https://www.add-for.com/wp-content/uploads/2017/01/octocat-wave-dribbble.gif',
    'https://typelevel.org/cats-effect/img/cats-logo.png']

function isNumeric (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}

//Define request response in root URL (/)
app.get('/avatar', function (req, res) {
    var avatar = {}
    var randomId = Math.floor(Math.random() * images.length)
    avatar.url = images[randomId]
    var delay = req.query.delay
    if (delay && isNumeric(delay)) {
        setTimeout(function () {
            res.send(avatar)
        }, delay)
    } else res.send(avatar)
})

app.get('/email', function (req, res) {
    var echo = req.query.value
    var delay = req.query.delay
    if (delay && isNumeric(delay)) {
        setTimeout(function () {
            res.send(echo)
        }, delay)
    } else
        res.send(echo)
})


//Define request response in root URL (/)
app.get('/*', function (req, res) {
    console.log(req.originalUrl)
    var delay = req.query.delay
    if (delay && isNumeric(delay)) {
        setTimeout(function () {
            res.send('delayed  OK: ' + req.path)
        }, delay)
    } else
        res.send('OK ' + req.path)
})



//Launch listening server on port 8081
app.listen(8081, function () {
    console.log('app listening on port 8081!')
})
```
<!-- wp:paragraph -->
<p>Now let us define the entities and controllers. The complete code is available in the github link mentioned above.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Entity</strong>:</p>
<!-- /wp:paragraph -->

### Entity
```kotlin
@Table(name = "user")
data class User(

    @Id
    var id: Long? = null,

    var name: String?,

    @Column("email_id")
    var emailId: String?,

    var avatar: String? = null,

    var createdAt: LocalDateTime? = null,

    var updatedAt: LocalDateTime? = LocalDateTime.now()

)
```

### Thread Per Request
<img src="/assets/coroutines/t.png"></img>

### Coroutines
<img src="/assets/coroutines/c.png"></img>
<!-- wp:paragraph -->
<p>Here we are marking <code>storeUser</code> as a <strong>suspend</strong>(more on this below) function and the IDE is showing there are three suspension points(Non blocking IO calls) line no <strong>26(validate email API)</strong>, <strong>30(avatar api)</strong> and <strong>33(saving user details in db)</strong>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Since we are using coroutines here, the async code looks sequential and imperative, if we don’t rely on coroutines then we may end up writing a lot of functional/combinational callback methods(map, flatMap, etc) where the business intent will be lost or difficult to understand. </p>
<!-- /wp:paragraph -->

## Benchmarks
<!-- wp:paragraph -->
<p>We are using <a href="https://github.com/tsenart/vegeta" target="_blank" rel="noreferrer noopener">Vegeta</a> as load testing tool and we will benchmark with following parameters</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Duration = 60 Seconds</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Rate = 30 Requests Per Second</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Total = 1800 Requests per min</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Delay = 4000(4 S)</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

### Thread Per Request
<img src="/assets/coroutines/b1.png"></img>

### Coroutines
<img src="/assets/coroutines/b2.png"></img>
<!-- wp:paragraph -->
<p>The numbers speak for itself as you can see coroutine implementation is better than traditional thread per requests and the beauty is we are still writing imperative/sequential code.</p>
<!-- /wp:paragraph -->

## Coroutines under the hood
<!-- wp:paragraph -->
<p>Now let us try to understand the internals of coroutines. Kotlin Coroutine mainly works with the following three concepts </p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Continuations</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Suspension Points</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>State Machine</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Let us understand these concepts with an minimal example</p>
<!-- /wp:paragraph -->

```kotlin
import kotlinx.coroutines.*

data class User(val id: Long, val name: String)

data class Post(val id: Long, val data: Any)

data class Comments(val id: Long, val postedBy: String, val comment: String)

object CoroutineFun {

    @JvmStatic
    fun main(args: Array<String>) = runBlocking {
        val user = User(1, "John")
        val postId = 2
        println("Fetching post $postId and comments for ${user.name}")

        val posts = fetchPost(user.id, postId)
        println("Posts = $posts")

        val comments = fetchComments(posts.id)
        println("Comments = $comments")
    }

    private suspend fun fetchPost(id: Long, postId: Int): Post {
        delay(1000)
        return Post(1, "Dummy Post")
    }

    private suspend fun fetchComments(id: Long): List<Comments> {
        delay(100)
        return listOf(Comments(1, "Anny", "Dummy Comment"))
    }
}
```

<p>In the above code block we are simulating fetching a post and its related comments of the user John. Here the function <strong>fetchPosts</strong> and <strong>fetchComments</strong> is marked as <code>suspend</code> which shows this is a non blocking function. A function that is tagged with <strong>suspend</strong> keyword can started, paused, and resumed at any given point of time.</p>
<!-- /wp:paragraph -->

### Continuations
<!-- wp:paragraph -->
<p>Every suspend function is transformed by the compiler to take a <a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a> object. In the above case, <strong>fetchPosts</strong> and <strong>fetchComments</strong> suspend functions will be transformed to take a <a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a> object when compiled, i.e <code>.<strong>fetchPosts</strong>(continuation)</code>. So we save all the state (like local variables, etc.) within this Continuation object and pass it to the suspend function. Similarly, all other suspend functions and blocks get transformed to take a Continuation object as well.</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/sp.png"></img>
<!-- wp:paragraph -->
<p><a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a>, as the name suggests, encapsulates the current state and also the information about how to continue from a particular suspension point later on.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>A suspension point in the code is like a check-point, at which the current state (like local variables, etc.) can be saved (inside a Continuation) to be resumed later on from where we left off. Everything that follows a particular suspension point (lines of code after the suspension point) is also saved within the Continuation object and passed on to the compiled suspend function for later execution.</p>
<!-- /wp:paragraph -->

### Suspension Points
<!-- wp:paragraph -->
<p>The Kotlin compiler converts the <strong>suspension points into states</strong>. In the above code block we have two suspension points(<strong>fetchPosts</strong> and <strong>fetchComments</strong>) and this is where the execution of the coroutine can be suspended and then resumed later. Now that we have identified, two suspension points in the above code, let us have a look at how these suspension points get transformed into different states using labels.</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/sp2.png"></img>

<!-- wp:paragraph -->
<p>Everything above and including a suspension-point is transformed into a state by the compiler. Everything below the suspension point until the next suspension point or till the end of the suspend function gets transformed into another state.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>So, we will have three states as shown above, i.e</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li><strong>L0</strong>: until the first suspension point</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>L1</strong>: until second suspension point</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><strong>L2:</strong>&nbsp;until the end</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->
<!-- wp:paragraph -->
<p><strong>A special object <a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a> will be injected into the suspendable functions like fetchPosts() and fetchComments()</strong></p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/c1.png"></img>
<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"12px"}}} -->
<p>
<center>Decompiled Kotlin JVM ByteCode to Java, As you can see both suspend functions receiving Continuation object as a parameter</center>
<!-- /wp:paragraph -->
</p>
### State Machine
<!-- wp:paragraph -->
<p>Now, using these three states as labels, a&nbsp;<code><a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a></code>&nbsp;state-machine is generated, which can resume execution from any of the states. Here is how the&nbsp;<code>Continuation</code>&nbsp;interface looks like :</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/c3.png"></img>
<!-- wp:paragraph {"align":"left"} -->
<p class="has-text-align-left">Now, let us have a look at the pseudo-code from the generated <code><a rel="noreferrer noopener" href="https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.coroutines/-continuation/" target="_blank">Continuation</a></code> state machine implementation by the compiler</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/is.png"></img>
<!-- wp:paragraph -->
<p>Each state is generated as a label and the execution can goto a particular label when resumed. Generated Continuation state machine implementation contains a field holding the current state, i.e. label, and all the intermediate data, i.e. local variables shared between different states.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>When the coroutine is started, resumeWith() is called with label = 0, and we enter the L0 state as shown in the figure below :</p>
<!-- /wp:paragraph -->
<img src="/assets/coroutines/p.png"></img>
<!-- wp:paragraph -->
<p>After calling <strong>fetchPosts</strong> the coroutine is suspended so the label will be set to 1 from 0. Similarly when <strong>fetchComments</strong> gets suspended we will update the label to 2 from 1. As you can see the code appears to us as sequential and behind the scenes it utilizes state machines to suspend and resume execution at various suspension points when needed.</p>
<!-- /wp:paragraph -->

## Conclusion
- With the help of coroutines we can write the non blocking code using imperative/sequential style.
- Coroutines are resumable tasks that are lightweight to create and schedule.
- We also know when and how a coroutine suspends during its execution.

## References
<!-- wp:group {"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:list -->
<ul><!-- wp:list-item -->
<li><a rel="noreferrer noopener" href="https://victorbrandalise.com/coroutines-part-i-grasping-the-fundamentals/" target="_blank">Coroutine Fundamentals</a></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li><a rel="noreferrer noopener" href="https://www.youtube.com/watch?v=hQrFfwT1IMo" target="_blank">Server Side Kotlin Coroutines</a></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></div>
<!-- /wp:group -->