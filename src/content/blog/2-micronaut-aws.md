---
author: Kishore Karunakaran
pubDatetime: 2020-11-24T21:22:05Z
title: Micronaut and AWS Lambda
postSlug: micronaut-aws-lambda
featured: true
draft: false
tags:
  - java
  - jvm
  - micronaut
  - aws
  - aws-lambda
ogImage: "/assets/micronaut/m1.png"
description:
  A year ago, I was developing an enterprise solution using aws lambda with Java and at that time there was no support for high level tools and frameworks in the ecosystem with respect to serverless space something like Spring Boot. I’ve used spring cloud in aws lambda but it didn’t work for the solution we are building. So I’ve started developing with the plain AWS SDK library and Speedment ORM but after building the few services I’ve felt a couple of bottlenecks.
---
<img src="/assets/micronaut/m1.jpeg"></img>
<!-- wp:paragraph -->
<p>A year ago, I was developing an enterprise solution using aws lambda with Java and at that time there was no support for high level tools and frameworks in the ecosystem with respect to Serverless space something like Spring Boot. I’ve used spring cloud in aws lambda but it didn’t work for the solution we are building. So I’ve started developing with the plain <a href="https://aws.amazon.com/sdk-for-java/">AWS SDK</a> library and<a href="https://speedment.com/open-source/"> Speedment ORM</a> but after building the few services I've felt a couple of bottlenecks.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>We need to encode and decode every request and response in each service</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Everytime when we add a new table or edit/modify any of the schemas we need to regenerate our entity classes via the speedment UI tool.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>We need to write many if and else statements to route the specific API endpoints to the corresponding service.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Sometimes speedment open source ORM generated SQL queries are not optimized thus takes longer time in querying data.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Lambda Cold Start Issue - A cold start happens when you execute an inactive Lambda function. The execution of an inactive Lambda function happens when there are no available containers, and the function needs to start up a new one and this takes 4-5 seconds. You can learn more about lambda cold start in this <a rel="noreferrer noopener" href="https://mikhail.io/serverless/coldstarts/aws/" target="_blank">post</a>.&nbsp;</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>In the late last year and early this year, two frameworks Micronaut and Quarkus came to the light which supports Serverless space in the Java ecosystem. Micronaut is inspired from spring but there is no runtime penalty for holding metadata for configuration and dependency injection. Every information is handled at compile time using AST processors.&nbsp;</p>
<!-- /wp:paragraph -->

## Table of contents

## Code Examples and Numbers
<!-- wp:paragraph -->
<p>This article is accompanied by a working code example&nbsp;<a rel="noreferrer noopener" href="https://github.com/thombergs/code-examples/tree/master/spring-boot/specification" target="_blank"><strong>on </strong></a><a rel="noreferrer noopener" href="https://github.com/khekrn/coding2fun/tree/master/Micronaut-AWS-Lambda" target="_blank"><strong>GitHub</strong></a>.</p>
<!-- /wp:paragraph -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:table {"align":"center","className":"is-style-stripes"} -->
<figure class="wp-block-table aligncenter is-style-stripes"><table><tbody><tr><td class="has-text-align-center" data-align="center"><strong>Type</strong></td><td class="has-text-align-center" data-align="center"><strong>Memory(In MB)</strong></td><td class="has-text-align-center" data-align="center"><strong>Startup Time</strong></td><td class="has-text-align-center" data-align="center"><strong>Package Size(In MB)</strong></td></tr><tr><td class="has-text-align-center" data-align="center">Micronaut Lambda</td><td class="has-text-align-center" data-align="center">2304</td><td class="has-text-align-center" data-align="center">7 s</td><td class="has-text-align-center" data-align="center">31</td></tr><tr><td class="has-text-align-center" data-align="center">Micronaut Lambda Native Image</td><td class="has-text-align-center" data-align="center">2304</td><td class="has-text-align-center" data-align="center">907 ms</td><td class="has-text-align-center" data-align="center">26</td></tr></tbody></table></figure>
<!-- /wp:table --></div>
<!-- /wp:group -->
To show case the productivity of the micronaut we are going to build a minimal blog post api using Micronaut, AWS Lambda and Postgres RDS.

## Choose How Lambda is Triggered
<!-- wp:paragraph -->
<p>To generate the micronaut module naviage to <a rel="noreferrer noopener" href="https://micronaut.io/launch/" target="_blank">https://micronaut.io/launch/</a> and select application type as <strong>Application</strong> with the following features</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>postgres</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>data-jpa</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>aws-lambda</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Now generate the project and import in IDE.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>The Micronaut application type you select depends on the triggers you want to support. To respond to incoming HTTP requests (e.g. AWS Lambda Proxy integrations in API Gateway), you can choose either Application or Serverless Function. For other triggers, such as consuming events from a queue or running on a schedule, choose Serverless Function.</p>
<!-- /wp:paragraph -->

<!-- wp:table {"className":"is-style-stripes"} -->
<figure class="wp-block-table is-style-stripes"><table><tbody><tr><td class="has-text-align-center" data-align="center"><strong>Application Type</strong></td><td class="has-text-align-center" data-align="center"><strong>Trigger Type</strong></td></tr><tr><td class="has-text-align-center" data-align="center">Application or Serverless Function</td><td class="has-text-align-center" data-align="center">HTTP requests to a single endpoint</td></tr><tr><td class="has-text-align-center" data-align="center">Application</td><td class="has-text-align-center" data-align="center">HTTP requests to multiple endpoints</td></tr><tr><td class="has-text-align-center" data-align="center">Serverless Function</td><td class="has-text-align-center" data-align="center">S3 events, events for a queue, schedule triggers etc.</td></tr></tbody></table></figure>
<!-- /wp:table -->

## Lambda Handlers
<!-- wp:paragraph -->
<p>Lambda function's handler is the method in your function code that processes events. When your function is invoked, Lambda runs the handler method. When the handler exits or returns a response, it becomes available to handle another event. The aws-lambda-java-core library defines two interfaces for handler methods. When coding your functions with Micronaut, you don't implement those interfaces directly. Instead, you extend or use its Micronaut equivalents.</p>
<!-- /wp:paragraph -->

<!-- wp:table {"className":"is-style-stripes"} -->
<figure class="wp-block-table is-style-stripes"><table><tbody><tr><td class="has-text-align-center" data-align="center"><strong>Application Type</strong></td><td class="has-text-align-center" data-align="center"><strong>AWS Handler Interface</strong></td><td class="has-text-align-center" data-align="center"><strong>Micronaut Handler Class</strong></td></tr><tr><td class="has-text-align-center" data-align="center">Serverless Function</td><td class="has-text-align-center" data-align="center"><a href="https://github.com/aws/aws-lambda-java-libs/blob/master/aws-lambda-java-core/src/main/java/com/amazonaws/services/lambda/runtime/RequestHandler.java" target="_blank" rel="noreferrer noopener">RequestHandler</a></td><td class="has-text-align-center" data-align="center"><a href="https://micronaut-projects.github.io/micronaut-aws/latest/api/io/micronaut/function/aws/MicronautRequestHandler.html">MicronautRequestHandler</a></td></tr><tr><td class="has-text-align-center" data-align="center">Serverless Function</td><td class="has-text-align-center" data-align="center"><a href="https://github.com/aws/aws-lambda-java-libs/blob/master/aws-lambda-java-core/src/main/java/com/amazonaws/services/lambda/runtime/RequestStreamHandler.java">RequestStreamHandler</a></td><td class="has-text-align-center" data-align="center"><a href="https://micronaut-projects.github.io/micronaut-aws/latest/api/io/micronaut/function/aws/MicronautRequestStreamHandler.html">MicronautRequestStreamHandler</a></td></tr><tr><td class="has-text-align-center" data-align="center">Application</td><td class="has-text-align-center" data-align="center">RequestStreamHandler &lt;AwsProxyRequest , AwsProxyResponse&gt;</td><td class="has-text-align-center" data-align="center"><a href="https://micronaut-projects.github.io/micronaut-aws/latest/api/io/micronaut/function/aws/proxy/MicronautLambdaHandler.html">MicronautLambdaHandler</a></td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:paragraph -->
<p>You can read more about <a href="https://micronaut.io/blog/2020-08-31-micronaut-2-aws-lambda.html" target="_blank" rel="noreferrer noopener">aws lambda guide in the micronaut page</a>.</p>
<!-- /wp:paragraph -->

## Database Tables and Entities
<!-- wp:paragraph -->
<p>Consider the following tables where <strong><em>posts</em></strong> and <strong><em>tags</em></strong> exhibit a many-to-many relationship between each other. The many-to-many relationship is implemented using a third table called <strong><em>post_tags</em></strong> which contains the details of posts and their associated tags.</p>
<!-- /wp:paragraph -->

### Post Entity
```java
@Entity
@Table(name = "post")
public class Post implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String title;

    private String description;

    private String content;

    @Column(name = "posted_at")
    private Date postedAt = new Date();

    @Column(name = "last_updated_at")
    private Date lastUpdatedAt = new Date();

    @ManyToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinTable(name = "post_tags", joinColumns = {@JoinColumn(name = "post_id")},
            inverseJoinColumns = {@JoinColumn(name = "tag_id")})
    private Set<Tag> tags = new HashSet<>();

    public Post() {
    }

    public Post(String title, String description, String content) {
        this.title = title;
        this.description = description;
        this.content = content;
    }
}
```

### Tag Entity
```java
@Entity
@Table(name = "tags")
public class Tag implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToMany(cascade = CascadeType.ALL, mappedBy = "tags", fetch = FetchType.EAGER)
    private Set<Post> posts = new HashSet<>();

    public Tag() {
    }

    public Tag(String name) {
        this.name = name;
    }
}
```

### Defining the Repositories

- Post Repository
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(nativeQuery = true, value = "select * from post where id in(select distinct(post_tags.post_id) " +
            "from post_tags where post_tags.tag_id in(:id))")
    List<Post> filterByTag(List<Long> id);
}
```

- Tag Repository
```java
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    @Query("Select t.id from Tag t where t.name in(:names)")
    List<Long> findByName(List<String> names);
}
```

### Controller
```java
@Controller("/v1")
public class PostTagController {

    private final PostTagService postTagService;

    @Inject
    public PostTagController(PostTagService postTagService) {
        this.postTagService = postTagService;
    }

    @Post(value = "/new-post", produces = MediaType.APPLICATION_JSON)
    public Response<CreatePostResponse> createPost(@Body CreatePostRequest createPostRequest) {
        log.info("In createPost");

        var response = new Response<CreatePostResponse>();

        try {
            var apiResponse = this.postTagService.createPost(createPostRequest);
            updateResponse(response, apiResponse, "200", "");
        } catch (BlogException e) {
            log.error("Error while creating post - " + e);
            updateResponse(response, null, "500", e.getMessage());
        }

        log.info("Return from createPost");
        return response;
    }

    @Get(value = "/list-tags", produces = MediaType.APPLICATION_JSON)
    public Response<List<String>> listTags() {
        log.info("In listTags");

        var response = new Response<List<String>>();
        try {
            var apiResponse = this.postTagService.listTags();
            updateResponse(response, apiResponse, "200", "");
        } catch (BlogException e) {
            log.error("Error while fetching post - " + e);
            updateResponse(response, null, "500", e.getMessage());
        }

        log.info("Return from listTags");
        return response;
    }
}
```
<!-- wp:paragraph -->
<p>This feels very similar to spring boot and it's more productive than before. Once you have the service ready you can deploy with few steps. </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Build the package with <code>mvn clean package</code> and deploy the Jar from target folder. </p>
<!-- /wp:paragraph -->

<img src="/assets/micronaut/l1.png"></img>
<!-- wp:paragraph -->
<p>Define the handler with <strong>com.blog.handler.BlogHandler</strong> which is a custom class that extends <a rel="noreferrer noopener" href="https://micronaut-projects.github.io/micronaut-aws/2.0.x/api/io/micronaut/function/aws/proxy/MicronautLambdaHandler.html" target="_blank">MicronautLambdaHandler.</a> If you choose not to define a custom handler, then we can set default <a rel="noreferrer noopener" href="https://micronaut-projects.github.io/micronaut-aws/2.0.x/api/io/micronaut/function/aws/proxy/MicronautLambdaHandler.html" target="_blank">MicronautLambdaHandler</a> using  <strong>io.micronaut.function.aws.proxy.MicronautLambdaHandler</strong> in the aws lambda.</p>
<!-- /wp:paragraph -->
<img src="/assets/micronaut/l2.png"></img>
<!-- wp:paragraph -->
<p>As you can see in the above image, it takes around nearly 7 seconds to initialize the lambda which means during cold starts it will take a minimum of 7 seconds to load our application. There are plenty of approaches to improve the cold start but here we will use native images to improve our cold start time.</p>
<!-- /wp:paragraph -->

## Native Image
<!-- wp:paragraph -->
<p>It's an AOT compiler for Java code to a standalone executable, called a native image. This executable includes the application classes, classes from its dependencies, runtime library classes, and statically linked native code from JDK. It does not run on the Java VM, but includes necessary components like memory management, thread scheduling, and so on from a different runtime system, called “Substrate VM”. Substrate VM is the name for the runtime components (like the deoptimizer, garbage collector, thread scheduling etc.). The resulting program has faster startup time and lower runtime memory overhead compared to a JVM.</p>
<!-- /wp:paragraph -->

### Installation
<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Install graalvm(Latest Version 20.3) using<a href="https://sdkman.io/"> SDKMAN</a> using <code>sdk install java 20.3.0.r11-grl</code>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Set the default java version as graalvm 20.3 using <code>sdk default java 20.3.0.r11-grl</code>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Finally, install native-image using command <code>gu install native-image</code>.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>In order to generate native image module, we need to choose two more features when generating micronaut module via <a rel="noreferrer noopener" href="https://micronaut.io/launch/" target="_blank">https://micronaut.io/launch/</a></p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>aws-lambda-custom-runtime</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>graalvm</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Once you create the native module, You can define the same entities, repositories and controller components as mentioned above. To create native image</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Package the module using the <code>mvn clean package</code>. This will generate the target jar.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Use native-image tool to build native image using <code>native-image -cp target/graal-wordpress--*.jar</code>.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Finally package the native image to deploy in aws lambda<!-- wp:list -->
<ul><!-- wp:list-item -->
<li><code>chmod 777 bootstrap</code></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>chmod 777 graal-wordpress</code></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><code>zip -j function.zip bootstrap pg-graal-wordpress</code></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list --></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Define <strong>io.micronaut.function.aws.proxy.MicronautLambdaHandler</strong> in the aws lambda as handler.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>When you deploy native image in AWS Lambda, we need to choose custom runtime as shown below and upload the ZIP file.</p>
<!-- /wp:paragraph -->

<img src="/assets/micronaut/l3.png"></img>
<img src="/assets/micronaut/l4.png"></img>
<!-- wp:paragraph -->
<p>With native image we can see the initialization is less than one second(907ms).  We have reduced our cold start time from 7 seconds to nearly 1 second.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Caveats:</strong></p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><!-- wp:list-item -->
<li>Micronaut graal native image for <a rel="noreferrer noopener" href="https://github.com/micronaut-projects/micronaut-sql/issues/369" target="_blank">MySQL is not stable</a> at this time(This is fixed).</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Not all java libraries are directly supported with native images.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>The build time of the native image will take approximately 5-6 minutes depends on your machine.</li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

## Conclusion
<!-- wp:list-item -->
<li>Micronaut and Graal VM are game changer for Java especially in the Serverless space.</li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li>Micronaut helps you to become more productive when building API’s using AWS Lambda or any other serverless technologies.</li>
<!-- /wp:list-item -->